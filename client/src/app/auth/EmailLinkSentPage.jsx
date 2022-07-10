import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import Tick from "../../assets/icons/Tick"
import IconPage from "../../components/IconPage"
import { AnalyticsManager } from "../../utils/AnalyticsManager"

export default function EmailLinkSentPage() {
  const { state } = useLocation()
  const email = state?.email

  useEffect(() => {
    AnalyticsManager.main.viewPage("EmailLinkSent")
  }, [])

  return (
    <IconPage
      Icon={Tick}
      title="Email link sent"
      body={`We sent a link to ${email} to sign in. It may take a moment to arrive, and make sure to check your spam folder.`}
    />
  )
}
