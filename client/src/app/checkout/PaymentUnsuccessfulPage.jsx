import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import IconActionPage from "../../components/IconActionPage"
import LoadingPage from "../../components/LoadingPage"
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

  const retryPath = state?.retryPath ?? "../choose-bank"

  const handleTryAgain = () => {
    AnalyticsManager.main.logEvent(AnalyticsEvent.PRESS_BUTTON, {
      button: "retryPayment",
    })
    navigate(retryPath)
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
        secondaryActionTitle="Cancel payment"
        secondaryAction={handleCancelOrder}
      />
    )
  }
}
