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

export default function RedirectPageMoneyhub() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { hash } = useLocation()
  const hashParams = parseHashParams(hash);

  const areVariablesInHash = Object.keys(hashParams).length > 0
  const [state, code, error, idToken] = ["state", "code", "error", "id_token"].map(i => hashParams[i] ?? searchParams.get(i));
  const [paymentAttemptId, stateId] = state.split(".")
  const [shouldMakePaymentCall, setShouldMakePaymentCall] = useState(false)
  const [hasRestoredState, setHasRestoredState] = useState(false)

  useEffect(() => {
    if (hasRestoredState) { return }

    restoreState(stateId).then(() => {
      setHasRestoredState(true)
    })
  }, [stateId, hasRestoredState])

  useEffect(() => {
    if (!hasRestoredState) { return }

    const unsub = onSnapshot(Collection.PAYMENT_ATTEMPT.docRef(paymentAttemptId), doc => {
      const { status, paymentIntentId } = doc.data()
      const basePath = `/checkout/${paymentIntentId}`;

      if (error) {
        console.log(error)

        if (error === "login_required") {
          navigate(`${basePath}/payment-cancelled`);
        } else {
          navigate(`${basePath}/payment-failure`);
        }
      } else {
        setShouldMakePaymentCall(true)

        switch (status) {
          case PaymentAttemptStatus.SUCCESSFUL:
            getDoc(Collection.PAYMENT_INTENT.docRef(paymentIntentId)).then(doc => {
              const paymentIntent = { id: doc.id, ...doc.data() }
              const successUrl = generateRedirectUrl(PaymentIntentStatus.SUCCESSFUL, paymentIntent)

              window.location.href = successUrl
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
  }, [error, paymentAttemptId, navigate, hasRestoredState])

  // Make the call to initiate payment
  useEffect(() => {
    const areRightVariablesPresent = !error && state && code && (!areVariablesInHash || idToken)

    if (areRightVariablesPresent && shouldMakePaymentCall) {
      console.log("Making call to confirm payment")
      confirmPayment(code, state, idToken).then(paymentAttemptId => {
        setShouldMakePaymentCall(false)
      })
    }
  }, [state, code, error, idToken, areVariablesInHash, shouldMakePaymentCall])

  return <LoadingPage message="Processing your order" />
}