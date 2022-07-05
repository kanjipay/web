import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Tick from "../../../../assets/icons/Tick"
import IconActionPage from "../../../../components/IconActionPage"
import { AnalyticsManager, PageName } from "../../../../utils/AnalyticsManager"

export default function EmailSubmittedPage({ order }) {
  const navigate = useNavigate()
  const orderId = order.id

  const merchantId = order.merchantId

  useEffect(() => {
    AnalyticsManager.main.viewPage(PageName.EMAIL_RECEIPT_SENT, { orderId })
  }, [orderId])

  return (
    <IconActionPage
      Icon={Tick}
      title="Emailed submitted"
      body="We'll email your receipt shortly"
      primaryActionTitle="Done"
      primaryAction={() => navigate(`/menu/${merchantId}`)}
    />
  )
}
