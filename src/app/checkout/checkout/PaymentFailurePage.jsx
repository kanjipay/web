import CircleIcon from "../../../components/CircleIcon"
import MainButton from "../../../components/MainButton"
import Spacer from "../../../components/Spacer"
import Cross from "../../../assets/icons/Cross"
import { ButtonTheme, Colors } from "../../../components/CircleButton"

export default function PaymentFailurePage() {
  return <div className="PaymentFailurePage container">
    <div className="centred" style={{ top: "64px", transform: "translate(-50%, 0)", width: 311 }}>
      <CircleIcon length={120} Icon={Cross} backgroundColor={Colors.RED_LIGHT} foregroundColor={Colors.RED} style={{ margin: "auto" }} />
      <Spacer y={2} />
      <div className="header-s">Your payment failed</div>
      <Spacer y={1} />
      <div className="text-body-faded">Don't worry, you haven't been charged</div>
    </div>

    <div className="anchored-bottom">
        <div style={{ margin: "16px" }}>
          <MainButton title="Try again" style={{ boxSizing: "borderBox" }} />
          <Spacer y={1} />
          <MainButton title="Cancel" style={{ boxSizing: "borderBox" }} buttonTheme={ButtonTheme.SECONDARY} />
        </div>
      </div>
  </div>
}