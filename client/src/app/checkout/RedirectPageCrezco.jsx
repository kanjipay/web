import { getDoc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoadingPage from "../../components/LoadingPage";
import Collection from "../../enums/Collection";
import PaymentAttemptStatus from "../../enums/PaymentAttemptStatus";
import PaymentIntentStatus from "../../enums/PaymentIntentStatus";
import { IdentityManager } from "../../utils/IdentityManager";
import { ApiName, NetworkManager } from "../../utils/NetworkManager";
import { generateRedirectUrl } from "./redirects";

export default function RedirectPageCrezco() {
  const [searchParams] = useSearchParams()
  const paymentAttemptId = searchParams.get("paymentAttemptId")
  const navigate = useNavigate()
  const [hasRedirected, setHasRedirected] = useState(false)
  const [isPolling, setIsPolling] = useState(false)
  const [shouldMakePaymentCheckCall, setShouldMakePaymentCheckCall] = useState(false)
  const [pollsMade, setPollsMade] = useState(0)
  const [hasPollingTimerStarted, setHasPollingTimerStarted] = useState(false)

  useEffect(() => {
    const unsub = onSnapshot(Collection.PAYMENT_ATTEMPT.docRef(paymentAttemptId), doc => {
      const { status, paymentIntentId, deviceId } = doc.data()
      const basePath = `/checkout/pi/${paymentIntentId}`;

      if (hasRedirected) { return }

      setHasRedirected(true)

      switch (status) {
        case PaymentAttemptStatus.SUCCESSFUL:
          getDoc(Collection.PAYMENT_INTENT.docRef(paymentIntentId)).then(doc => {
            const paymentIntent = { id: doc.id, ...doc.data() }
            const currentDeviceId = IdentityManager.main.getDeviceId()

            if (currentDeviceId === deviceId) {
              const successUrl = generateRedirectUrl(PaymentIntentStatus.SUCCESSFUL, paymentIntent)
              window.location.href = successUrl
            } else {
              navigate(`${basePath}/mobile-finished`)
            }
          })
          break;
        case PaymentAttemptStatus.FAILED:
          navigate(`${basePath}/payment-failure`);
          break;
        default:
      }
    })

    return () => {
      unsub()
    }
  }, [paymentAttemptId, navigate, hasRedirected])

  // It may be that the webhook hasn't worked so need to call polling endpoint every few secs
  // useEffect(() => {
  //   if (isPolling) {

  //     if (shouldMakePaymentCheckCall && pollsMade < 5) {
  //       setShouldMakePaymentCheckCall(false)
  //       setPollsMade(pollsMade + 1)

  //       NetworkManager.post(ApiName.INTERNAL, `/payment-attempts/pa/${paymentAttemptId}/check-status`).then(res => {
  //         const { paymentAttemptStatus } = res.data

  //         // If still pending, make call again
  //         if (paymentAttemptStatus === PaymentAttemptStatus.PENDING) {
  //           setTimeout(() => {
  //             setShouldMakePaymentCheckCall(true)
  //           }, 1000)
  //         }
  //       })
  //     }
  //   } else if (!hasPollingTimerStarted) {
  //     setHasPollingTimerStarted(true)
  //     // Start polling after 5 seconds on the page
  //     setTimeout(() => {
  //       setShouldMakePaymentCheckCall(true)
  //       setIsPolling(true)
  //     }, 6000)
  //   }
  // }, [isPolling, paymentAttemptId, shouldMakePaymentCheckCall, pollsMade, hasPollingTimerStarted, navigate])

  return <LoadingPage />
}