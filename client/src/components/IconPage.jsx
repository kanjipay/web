import CircleIcon from "./CircleIcon";
import MainButton from "./MainButton";
import Spacer from "./Spacer";
import { ButtonTheme } from "./CircleButton";

export default function IconPage({
  Icon,
  iconBackgroundColor,
  iconForegroundColor,
  title,
  body,
}) {
  return <div className="container">
    <div className="centred-top">
      <CircleIcon
        length={120}
        Icon={Icon}
        backgroundColor={iconBackgroundColor}
        foregroundColor={iconForegroundColor}
        style={{ margin: "auto" }}
      />
      <Spacer y={2} />
      <div className="header-s">{title}</div>
      <Spacer y={1} />
      <div className="text-body-faded">{body}</div>
    </div>
  </div>
}
