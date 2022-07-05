import { useEffect } from "react"
import Tick from "../../assets/icons/Tick"
import IconPage from "../../components/IconPage"
import { AnalyticsManager } from "../../utils/AnalyticsManager"

export default function VerificationLinkSentPage() {
  useEffect(() => {
    AnalyticsManager.main.viewPage("VerificationLinkSent")
  }, [])

  return (
    <IconPage
      Icon={Tick}
      title="Verification link sent"
      body="We sent you a verification email. Please follow the link contained in this email to continue"
    />
  )
}
