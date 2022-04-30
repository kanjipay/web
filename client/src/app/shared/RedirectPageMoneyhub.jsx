import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import LoadingPage from "../../components/LoadingPage";
import PaymentAttemptStatus from "../../enums/PaymentAttemptStatus";
import { confirmPayment } from "../../utils/services/PaymentsService";
import { parseHashParams } from "../../utils/helpers/parseHashParams";
import { generateRedirectUrl } from "../checkout/redirects";
import PaymentIntentStatus from "../../enums/PaymentIntentStatus";
import { getDoc, onSnapshot } from "firebase/firestore";
import Collection from "../../enums/Collection";
import { restoreState } from "../../utils/services/StateService";
import axios from "axios";
import { IdentityManager } from "../../utils/IdentityManager";

export default function RedirectPageMoneyhub() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { hash } = useLocation()
  const hashParams = parseHashParams(hash);

  const areVariablesInHash = Object.keys(hashParams).length > 0
  const [state, code, error, idToken] = ["state", "code", "error", "id_token"].map(i => hashParams[i] ?? searchParams.get(i));
  const [paymentAttemptId, stateId] = state.split(".")
  const [hasMadePaymentCall, setHasMadePaymentCall] = useState(false)
  const [hasRestoredState, setHasRestoredState] = useState(false)
  const [isPolling, setIsPolling] = useState(false)
  const [shouldMakePaymentCheckCall, setShouldMakePaymentCheckCall] = useState(false)
  const [pollsMade, setPollsMade] = useState(0)
  const [hasPollingTimerStarted, setHasPollingTimerStarted] = useState(false)
  const [hasRedirected, setHasRedirected] = useState(false)

  // Restore local state
  useEffect(() => {
    if (hasRestoredState) { return }

    restoreState(stateId, false).then(() => {
      setHasRestoredState(true)
    })
  }, [stateId, hasRestoredState])

  // Make the call to initiate payment
  useEffect(() => {
    const areRightVariablesPresent = !error && state && code && (!areVariablesInHash || idToken)

    if (areRightVariablesPresent && !hasMadePaymentCall) {
      confirmPayment(code, state, idToken).then(paymentAttemptId => {
        setHasMadePaymentCall(true)
      })
    }
  }, [state, code, error, idToken, areVariablesInHash, hasMadePaymentCall])

  // Start listening for update to payment attempt status after state is restored
  useEffect(() => {
    if (!hasRestoredState) { return }

    const unsub = onSnapshot(Collection.PAYMENT_ATTEMPT.docRef(paymentAttemptId), doc => {
      const { status, paymentIntentId, deviceId } = doc.data()
      const basePath = `/checkout/${paymentIntentId}`;

      if (error) {
        console.log(error)

        if (error === "login_required") {
          navigate(`${basePath}/payment-cancelled`);
        } else {
          navigate(`${basePath}/payment-failure`);
        }
      } else {
        switch (status) {
          case PaymentAttemptStatus.SUCCESSFUL:
            console.log("Got successful payment status change")
            getDoc(Collection.PAYMENT_INTENT.docRef(paymentIntentId)).then(doc => {
              if (hasRedirected) { return }

              const paymentIntent = { id: doc.id, ...doc.data() }
              const currentDeviceId = IdentityManager.main.getDeviceId()

              if (currentDeviceId === deviceId) {
                const successUrl = generateRedirectUrl(PaymentIntentStatus.SUCCESSFUL, paymentIntent)
                window.location.href = successUrl
              } else {
                navigate(`${basePath}/mobile-finished`)
              }

              setHasRedirected(true)
            })

            break;
          case PaymentAttemptStatus.CANCELLED:
            navigate(`${basePath}/payment-cancelled`);
            break;
          case PaymentAttemptStatus.FAILED:
            navigate(`${basePath}/payment-failure`);
            break;
          default:
        }
      }
    })

    return () => {
      unsub()
    }
  }, [error, paymentAttemptId, navigate, hasRestoredState, hasRedirected])


  // It may be that the webhook hasn't worked so need to call polling endpoint every few secs
  useEffect(() => {
    if (isPolling) {
      
      if (shouldMakePaymentCheckCall && pollsMade < 5) {
        console.log("isPolling and shouldMakePaymentCheckCall are true")
        setShouldMakePaymentCheckCall(false)
        setPollsMade(pollsMade + 1)

        axios.post(`${process.env.REACT_APP_BASE_SERVER_URL}/internal/api/v1/payment-attempts/pa/${paymentAttemptId}/check-status`)
          .then(res => {
            const { paymentAttemptStatus } = res.data

            // If still pending, make call again
            if (paymentAttemptStatus === PaymentAttemptStatus.PENDING) {
              setTimeout(() => {
                setShouldMakePaymentCheckCall(true)
              }, 1000)
            }
          })
      }
    } else if (!hasPollingTimerStarted) {
      console.log("isPolling and hasPollingTimerStarted are false, so start polling after 5 seconds")
      setHasPollingTimerStarted(true)
      // Start polling after 5 seconds on the page
      setTimeout(() => {
        console.log("setting isPolling to true")
        setShouldMakePaymentCheckCall(true)
        setIsPolling(true)
      }, 6000)
    }
  }, [hasMadePaymentCall, isPolling, paymentAttemptId, shouldMakePaymentCheckCall, pollsMade, hasPollingTimerStarted, navigate])

  return <LoadingPage message="Processing your order" />
}