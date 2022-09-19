import { useEffect } from "react"
import Tick from "../../assets/icons/Tick"
import CircleIcon from "../../components/CircleIcon"
import Content from "../../components/layout/Content"
import Spacer from "../../components/Spacer"
import { AnalyticsManager } from "../../utils/AnalyticsManager"
import { Container } from "../brand/FAQsPage"

export default function MobileFinishedPage() {
  useEffect(() => {
    AnalyticsManager.main.viewPage("CheckoutMobileFinished")
  })

  return (
    <Container maxWidth={500}>
      <Content>
        <div style={{ maxWidth: 400, margin: "auto", textAlign: "center" }}>
          <CircleIcon Icon={Tick} length={120} style={{ margin: "auto" }} />
          <Spacer y={2} />
          <h3 className="header-s">Payment complete</h3>
          <Spacer y={2} />
          <p className="text-body-faded">
            You can now return to your original device.
          </p>
        </div>
      </Content>
    </Container>
  )
}
