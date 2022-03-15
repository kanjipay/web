import { useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Tick from "../../../assets/icons/Tick"
import { Colors } from "../../../components/CircleButton"
import IconActionPage from "../../../components/IconActionPage"
import { PageName, viewPage } from "../../../utils/AnalyticsManager"

export default function EmailSubmittedPage() {
  const navigate = useNavigate()

  const { orderId } = useParams()

  useEffect(() => {
    viewPage(PageName.EMAIL_RECEIPT_SENT, { orderId })
  }, [orderId])

  return <IconActionPage
    Icon={Tick}
    iconBackgroundColor={Colors.PRIMARY_LIGHT}
    iconForegroundColor={Colors.PRIMARY}
    title="Emailed submitted"
    body="We'll email your receipt shortly"
    primaryActionTitle="Done"
    primaryAction={() => navigate('../..')}
  />
}