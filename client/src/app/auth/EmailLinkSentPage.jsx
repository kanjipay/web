import { useEffect } from "react"
import Tick from "../../assets/icons/Tick"
import IconPage from "../../components/IconPage"
import { AnalyticsManager } from "../../utils/AnalyticsManager"

export default function EmailLinkSentPage() {
  useEffect(() => {
    AnalyticsManager.main.viewPage("EmailLinkSent")
  }, [])

  return (
    <IconPage
      Icon={Tick}
      title="Email link sent"
      body="We sent you an email link for you to sign in. It may take a moment to arrive and make sure to check your spam folder."
    />
  )
}
