import CircleIcon from "./CircleIcon";
import MainButton from "./MainButton";
import Spacer from "./Spacer";
import { ButtonTheme } from "./CircleButton";

export default function IconActionPage({
  Icon,
  iconBackgroundColor,
  iconForegroundColor,
  title,
  body,
  primaryActionTitle,
  primaryAction,
  primaryIsLoading = false,
  secondaryActionTitle,
  secondaryAction,
  secondaryIsLoading = false,
}) {
  return (
    <div className="container">
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

      <div className="anchored-bottom">
        <div style={{ margin: "16px" }}>
          <MainButton
            title={primaryActionTitle}
            style={{ boxSizing: "borderBox" }}
            isLoading={primaryIsLoading}
            onClick={primaryAction}
            buttonTheme={ButtonTheme.MONOCHROME}
          />

          {secondaryActionTitle && secondaryAction && (
            <div>
              <Spacer y={1} />
              <MainButton
                title={secondaryActionTitle}
                style={{ boxSizing: "borderBox" }}
                isLoading={secondaryIsLoading}
                onClick={secondaryAction}
                buttonTheme={ButtonTheme.MONOCHROME_OUTLINED}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
