import CircleIcon from "./CircleIcon";
import MainButton from "./MainButton";
import Spacer from "./Spacer";
import { ButtonTheme } from "./ButtonTheme";
import { Colors } from "../enums/Colors";
import { isMobile } from "react-device-detect";

export default function IconActionPage({
  Icon,
  iconBackgroundColor = Colors.OFF_WHITE_LIGHT,
  iconForegroundColor = Colors.BLACK,
  title,
  body,
  primaryActionTitle,
  primaryAction,
  primaryIsLoading = false,
  secondaryActionTitle,
  secondaryAction,
  secondaryIsLoading = false,
}) {
  const buttons = <div style={{ margin: "16px" }}>
    {
      primaryActionTitle && primaryAction && <MainButton
        title={primaryActionTitle}
        style={{ boxSizing: "borderBox" }}
        isLoading={primaryIsLoading}
        onClick={primaryAction}
        buttonTheme={ButtonTheme.MONOCHROME}
      />
    }
    

    {
      secondaryActionTitle && secondaryAction && <div>
        <Spacer y={1} />
        <MainButton
          title={secondaryActionTitle}
          style={{ boxSizing: "borderBox" }}
          isLoading={secondaryIsLoading}
          onClick={secondaryAction}
          buttonTheme={ButtonTheme.MONOCHROME_OUTLINED}
        />
      </div>
    }
  </div>;

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
        <div className="header-s">{title}</div>
        <Spacer y={2} />
        <div className="text-body-faded">{body}</div>

        {
          !isMobile && buttons
        }
      </div>

      {
        isMobile && <div className="anchored-bottom">
          {buttons}
        </div>
      }
      
    </div>
  );
}
