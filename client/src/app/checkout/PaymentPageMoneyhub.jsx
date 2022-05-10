import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import LoadingPage from "../../components/LoadingPage";
import { IdentityManager } from "../../utils/IdentityManager";
import { createPaymentAttemptMoneyhub } from "../../utils/services/PaymentsService";

export default function PaymentPageMoneyhub({ paymentIntent }) {
  const location = useLocation();
  const { bankId, referringDeviceId } = location.state
  const paymentIntentId = paymentIntent.id

  useEffect(() => {
    const deviceId = referringDeviceId ?? IdentityManager.main.getDeviceId()
    createPaymentAttemptMoneyhub(paymentIntentId, bankId, deviceId).then(authUrl => {
      window.location.href = authUrl
    })
  }, [bankId, paymentIntentId, referringDeviceId])

  return <LoadingPage message="Sending you to your bank" />
}