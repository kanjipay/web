import { useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import IconActionPage from "../../components/IconActionPage"
import LoadingPage from "../../components/LoadingPage"
import { PaymentType } from "../../enums/PaymentType"
import { AnalyticsEvent, AnalyticsManager } from "../../utils/AnalyticsManager"
import { cancelOrder } from "./cancelOrder"

export default function PaymentUnsuccessfulPage({
  Icon,
  iconBackgroundColor,
  iconForegroundColor,
  title,
  body,
  order,
}) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const { state } = useLocation()
  const { orderId } = useParams()

  const retryPath = state?.retryPath ?? "../choose-bank"
  const paymentType = state?.paymentType
  const wasOpenBankingPayment = paymentType === PaymentType.OPEN_BANKING

  const handleTryAgain = () => {
    AnalyticsManager.main.logEvent(AnalyticsEvent.PRESS_BUTTON, {
      button: "retryPayment",
    })
    navigate(retryPath)
  }

  const handleCardPayment = () => {
    navigate(`/checkout/o/${orderId}/payment-stripe`)
  }

  const handleCancelOrder = async () => {
    await cancelOrder(order, navigate)
  }

  if (isLoading) {
    return <LoadingPage />
  } else {
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
}
