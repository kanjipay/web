import CircleIcon from "./CircleIcon"
import Spacer from "./Spacer"
import { Colors } from "../enums/Colors"
import { isMobile } from "react-device-detect"

export default function IconPage({
  Icon,
  iconBackgroundColor = Colors.OFF_WHITE_LIGHT,
  iconForegroundColor = Colors.BLACK,
  title,
  body,
  name
}) {
  return (
    <div className="container">
      <div className="centred-top" style={{ width: isMobile ? 311 : 400 }}>
        <CircleIcon
          length={120}
          Icon={Icon}
          backgroundColor={iconBackgroundColor}
          foregroundColor={iconForegroundColor}
          style={{ margin: "auto" }}
        />
        <Spacer y={2} />
        <div className="header-s" test-id={`icon-page-title-${name}`}>{title}</div>
        <Spacer y={2} />
        <div className="text-body-faded" test-id={`icon-page-body-${name}`}>{body}</div>
      </div>
    </div>
  )
}
