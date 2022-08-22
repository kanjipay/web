import { isMobile } from "react-device-detect";
import Spacer from "../../components/Spacer";
import { Colors } from "../../enums/Colors";

export default function Testimonial({ name, image, body }) {
  return <div 
    style={{
      position: "relative",
      padding: "32px 48px"
    }}
  >
    <p style={{ position: "absolute", top: 0, left: 0, fontSize: 120, fontWeight: 600 }}>"</p>
    <p style={{ position: "absolute", bottom: 0, right: 0, fontSize: 120, fontWeight: 600 }}>"</p>
    <p style={{ fontSize: isMobile ? "1.1em" : "1.25em" }}>{body}</p>
    <Spacer y={2} />
    <div style={{ display: "flex", alignItems: "center", columnGap: 12 }}>
      <img alt="" src={image} style={{ borderRadius: 24, height: 48, width: 48 }} />
      <p style={{ color: Colors.GRAY_LIGHT, fontSize: isMobile ? "1.1em" : "1.25em" }}>{name}</p>
    </div>
  </div>
}