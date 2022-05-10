import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import LoadingPage from "../../components/LoadingPage";
import { IdentityManager } from "../../utils/IdentityManager";
import { createPaymentAttemptCrezco } from "../../utils/services/PaymentsService";

export default function PaymentPageCrezco({ paymentIntent }) {
  const location = useLocation();
  const { bankCode, referringDeviceId } = location.state
  const paymentIntentId = paymentIntent.id

  useEffect(() => {
    const deviceId = referringDeviceId ?? IdentityManager.main.getDeviceId()
    createPaymentAttemptCrezco(paymentIntentId, bankCode, deviceId).then(redirectUrl => {
      window.location.href = redirectUrl
    })
  }, [bankCode, paymentIntentId, referringDeviceId])

  return <LoadingPage message="Sending you to your bank" />
}