import { useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Tick from "../../assets/icons/Tick"
import CircleIcon from "../../components/CircleIcon"
import Content from "../../components/layout/Content"
import Spacer from "../../components/Spacer"
import Collection from "../../enums/Collection"
import { AnalyticsManager } from "../../utils/AnalyticsManager"
import { Body } from "../auth/AuthPage"
import { Container } from "../brand/FAQsPage"
import { redirectOrderIfNeeded } from "./cancelOrder"

export default function MobileHandoverPage() {
  // Should be polling order for status paid
  const { orderId } = useParams()
  const navigate = useNavigate()

  useEffect(() => AnalyticsManager.main.viewPage("CheckoutMobileHandover", { orderId }), [orderId])

  useEffect(() => {
    return Collection.ORDER.onChange(orderId, (order) => {
      redirectOrderIfNeeded(order, navigate)
    })
  }, [orderId, navigate])

  return (
    <Container maxWidth={500}>
      <Content>
        <Spacer y={12} />
        <div style={{ maxWidth: 400, margin: "auto", textAlign: "center" }}>
          <CircleIcon Icon={Tick} length={120} style={{ margin: "auto" }} />
          <Spacer y={2} />
          <h3 className="header-s">Your mobile is synced</h3>
          <Spacer y={2} />
          <Body isFaded>
            Don't reload this page. We'll redirect you once you complete your
            payment on your mobile device.
          </Body>
        </div>
      </Content>
    </Container>
  )
}
