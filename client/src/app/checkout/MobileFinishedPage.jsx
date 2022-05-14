import Tick from "../../assets/icons/Tick";
import { Colors } from "../../components/CircleButton";
import CircleIcon from "../../components/CircleIcon";
import Spacer from "../../components/Spacer";

export default function MobileFinishedPage() {
  return <div className="container">
    <div className="content">
      <Spacer y={12} />
      <div style={{ maxWidth: 420, margin: "auto", textAlign: "center" }}>
        <CircleIcon
          Icon={Tick}
          length={120}
          style={{ margin: "auto" }}
        />
        <Spacer y={2} />
        <h3 className="header-s">Payment complete</h3>
        <Spacer y={2} />
        <p className="text-body-faded">You can now return to your original device.</p>
      </div>
    </div>
  </div>
}