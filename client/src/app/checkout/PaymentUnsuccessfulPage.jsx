import { useLocation, useNavigate, useParams } from "react-router-dom"
import IconActionPage from "../../components/IconActionPage"
import { PaymentType } from "../../enums/PaymentType"
import { AnalyticsManager } from "../../utils/AnalyticsManager"
import { cancelOrder } from "./cancelOrder"

export default function PaymentUnsuccessfulPage({
  Icon,
  iconBackgroundColor,
  iconForegroundColor,
  title,
  body,
}) {
  const navigate = useNavigate()

  const { state } = useLocation()
  const { orderId } = useParams()

  const retryPath = state?.retryPath ?? "../choose-bank"
  const paymentType = state?.paymentType
  const wasOpenBankingPayment = paymentType === PaymentType.OPEN_BANKING

  const handleTryAgain = () => {
    AnalyticsManager.main.pressButton("retryPayment")

    if (wasOpenBankingPayment) {
      localStorage.removeItem("crezcoBankCode")
    }
    
    navigate(retryPath)
  }

  const handleCardPayment = () => {
    navigate(`/checkout/o/${orderId}/payment-stripe`)
  }

  const handleCancelOrder = async () => {
    await cancelOrder(orderId, navigate)
  }

  return (
    <IconActionPage
      Icon={Icon}
      iconBackgroundColor={iconBackgroundColor}
      iconForegroundColor={iconForegroundColor}
      title={title}
      body={body}
      primaryActionTitle="Try again"
      primaryAction={handleTryAgain}
      secondaryActionTitle={
        wasOpenBankingPayment ? "Pay with card instead" : "Cancel payment"
      }
      secondaryAction={
        wasOpenBankingPayment ? handleCardPayment : handleCancelOrder
      }
    />
  )
}
