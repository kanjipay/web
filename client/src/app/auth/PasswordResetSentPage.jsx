import { useEffect } from "react"
import Tick from "../../assets/icons/Tick"
import IconPage from "../../components/IconPage"
import { AnalyticsManager } from "../../utils/AnalyticsManager"

export default function PasswordResetSentPage() {
  useEffect(() => {
    AnalyticsManager.main.viewPage("PasswordResetSent")
  }, [])

  return (
    <IconPage
      Icon={Tick}
      title="Check your inbox"
      body="If your account exists, we'll have sent you a password reset email. It may take a moment to arrive."
    />
  )
}
