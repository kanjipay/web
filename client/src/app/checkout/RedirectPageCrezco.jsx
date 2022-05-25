import { getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoadingPage from "../../components/LoadingPage";
import Collection from "../../enums/Collection";
import PaymentAttemptStatus from "../../enums/PaymentAttemptStatus";
import PaymentIntentStatus from "../../enums/PaymentIntentStatus";
import { IdentityManager } from "../../utils/IdentityManager";
import { generateRedirectUrl } from "./redirects";

export default function RedirectPageCrezco() {
  const [searchParams] = useSearchParams()
  const paymentAttemptId = searchParams.get("paymentAttemptId")
  const navigate = useNavigate()
  const [hasRedirected, setHasRedirected] = useState(false)

  useEffect(() => {
    return Collection.PAYMENT_ATTEMPT.onChange(paymentAttemptId, paymentAttempt => {
      const { status, paymentIntentId, deviceId } = paymentAttempt
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
  }, [paymentAttemptId, navigate, hasRedirected])

  return <LoadingPage />
}