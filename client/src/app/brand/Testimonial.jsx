import { isMobile } from "react-device-detect";
import { Flex } from "../../components/Listing";
import Spacer from "../../components/Spacer";
import { Colors } from "../../enums/Colors";

function FiveStars({ style, ...props }) {
  const star = <img alt="" src="/img/star.png" style={{ height: 32, aspectRatio: "1/1" }} />

  return <Flex columnGap={2} style={{ justifyContent: "center", ...style }} {...props}>
    {star}
    {star}
    {star}
    {star}
    {star}
  </Flex>
}

export default function Testimonial({ name, image, body }) {
  return <div 
    style={{
      backgroundColor: Colors.OFF_WHITE_LIGHT,
      padding: 32,
      borderRadius: 8
    }}
  >
    <FiveStars style={{ margin: "auto" }} />
    <Spacer y={2} />
    <p style={{ fontSize: isMobile ? "1.1em" : "1.25em", textAlign: "center" }}>{body}</p>
    <Spacer y={2} />
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", columnGap: 12 }}>
      <img alt="" src={image} style={{ borderRadius: 24, height: 48, width: 48 }} />
      <p style={{ color: Colors.GRAY_LIGHT, fontSize: isMobile ? "1.1em" : "1.25em" }}>{name}</p>
    </div>
  </div>
}