import { useEffect } from "react"
import Cross from "../../assets/icons/Cross"
import { Colors } from "../../enums/Colors"
import { AnalyticsManager, PageName } from "../../utils/AnalyticsManager"
import PaymentUnsuccessfulPage from "./PaymentUnsuccessfulPage"

export default function PaymentFailurePage() {
  useEffect(() => {
    AnalyticsManager.main.viewPage("PaymentFailure")
  }, [])

  return (
    <PaymentUnsuccessfulPage
      Icon={Cross}
      iconBackgroundColor={Colors.RED_LIGHT}
      iconForegroundColor={Colors.RED}
      title="Your payment failed"
      body="Don't worry, you haven't been charged"
      pageName={PageName.PAYMENT_FAILURE}
    />
  )
}
