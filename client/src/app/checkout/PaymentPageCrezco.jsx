import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import LoadingPage from "../../components/LoadingPage";
import { IdentityManager } from "../../utils/IdentityManager";
import { createPaymentAttemptCrezco } from "../../utils/services/PaymentsService";

export default function PaymentPageCrezco({ order }) {
  const location = useLocation();
  const { bankCode, countryCode, referringDeviceId } = location.state
  const orderId = order.id

  useEffect(() => {
    const deviceId = referringDeviceId ?? IdentityManager.main.getDeviceId()
    createPaymentAttemptCrezco(orderId, bankCode, countryCode, deviceId).then(redirectUrl => {
      window.location.href = redirectUrl
    })
  }, [bankCode, countryCode, orderId, referringDeviceId])

  return <LoadingPage message="Sending you to your bank" />
}