import Tick from "../assets/icons/Tick";
import Cross from "../assets/icons/Cross";
import Details from "../assets/icons/Details";
import { Colors } from "../enums/Colors";
import CircleIcon from "./CircleIcon";

export class ResultType {
  static SUCCESS = new ResultType(Colors.OFF_WHITE_LIGHT, Colors.BLACK, Tick);
  static ERROR = new ResultType(Colors.RED_LIGHT, Colors.RED, Cross);
  static INFO = new ResultType(Colors.OFF_WHITE_LIGHT, Colors.BLACK, Details);

  constructor(
    backgroundColor,
    foregroundColor,
    Icon,
    textColor = Colors.BLACK
  ) {
    this.backgroundColor = backgroundColor;
    this.foregroundColor = foregroundColor;
    this.Icon = Icon;
    this.textColor = textColor;
  }
}

export default function ResultBanner({ resultType, message }) {
  const bannerStyle = {
    backgroundColor: resultType.backgroundColor,
    padding: "12px 16px",
  };

  return (
    <div style={bannerStyle}>
      <div className="flex-container">
        <CircleIcon
          Icon={resultType.Icon}
          length={24}
          backgroundColor={resultType.foregroundColor}
          foregroundColor={Colors.WHITE}
          style={{ marginRight: 8 }}
        />
        <span style={{ color: resultType.textColor }}>{message}</span>
      </div>
    </div>
  );
}
