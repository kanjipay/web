import { useEffect } from "react"
import { useLocation, useParams } from "react-router-dom"
import LoadingPage from "../../components/LoadingPage"
import { AnalyticsManager } from "../../utils/AnalyticsManager"
import { IdentityManager } from "../../utils/IdentityManager"
import { createPaymentAttemptCrezco } from "../../utils/services/PaymentsService"

export default function PaymentPageCrezco({ order }) {
  const { orderId } = useParams()

  useEffect(() => {
    AnalyticsManager.main.viewPage("CrezcoPayment", { orderId })
  }, [orderId])

  const location = useLocation()
  const { bankCode, countryCode, referringDeviceId } = location.state

  useEffect(() => {
    if (!order) { return }
    
    localStorage.setItem("crezcoBankCode", bankCode)
    const deviceId = referringDeviceId ?? IdentityManager.main.getDeviceId()

    createPaymentAttemptCrezco(orderId, bankCode, countryCode, deviceId).then(
      (redirectUrl) => {
        window.location.href = redirectUrl
      }
    )
  }, [bankCode, countryCode, orderId, referringDeviceId, order])

  return <LoadingPage message="Sending you to your bank" />
}
