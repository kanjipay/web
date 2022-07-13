import Tick from "../assets/icons/Tick"
import Cross from "../assets/icons/Cross"
import { Colors } from "../enums/Colors"
import CircleIcon from "./CircleIcon"
import SmallButton from "./SmallButton"
import Warning from "../assets/icons/Warning"

export class ResultType {
  static SUCCESS = new ResultType(Colors.OFF_WHITE_LIGHT, Colors.BLACK, Tick)
  static ERROR = new ResultType(Colors.RED_LIGHT, Colors.RED, Cross)
  static INFO = new ResultType(
    Colors.OFF_WHITE_LIGHT,
    Colors.GRAY_LIGHT,
    Warning
  )

  constructor(
    backgroundColor,
    foregroundColor,
    Icon,
    textColor = Colors.BLACK
  ) {
    this.backgroundColor = backgroundColor
    this.foregroundColor = foregroundColor
    this.Icon = Icon
    this.textColor = textColor
  }
}

export default function ResultBanner({
  resultType,
  message,
  action = undefined,
  actionTitle = undefined,
}) {
  const bannerStyle = {
    backgroundColor: resultType.backgroundColor,
    padding: "12px 16px",
  }

  return (
    <div style={bannerStyle}>
      <div style={{ display: "flex", columnGap: 8, alignItems: "center" }}>
        <CircleIcon
          Icon={resultType.Icon}
          length={28}
          backgroundColor={resultType.foregroundColor}
          foregroundColor={Colors.WHITE}
          style={{ marginRight: 8 }}
        />
        <span style={{ color: resultType.textColor }}>{message}</span>
        {action && actionTitle && (
          <SmallButton title={actionTitle} onClick={action} />
        )}
      </div>
    </div>
  )
}
