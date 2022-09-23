import { FeedbackProvider } from "../app/auth/AuthPage"
import Spinner from "../assets/Spinner"
import { Colors } from "../enums/Colors"
import { ButtonTheme } from "./ButtonTheme"

export default function SmallButton({
  buttonTheme = ButtonTheme.MONOCHROME,
  title,
  style,
  isLoading = false,
  onClick,
  ...props
}) {

  return <FeedbackProvider isInline={false}>{(isHovering, isPressed) => {
    let backgroundColor

    if (props.disabled) {
      backgroundColor = buttonTheme.disabledBackgroundColor
    } else if (isPressed || isHovering) {
      backgroundColor = buttonTheme.pressedBackgroundColor
    } else {
      backgroundColor = buttonTheme.backgroundColor
    }

    const foregroundColor = props.disabled
      ? buttonTheme.disabledForegroundColor
      : buttonTheme.foregroundColor

    const buttonStyle = {
      backgroundColor,
      padding: "6px 10px",
      display: "flex",
      outline: "none",
      borderRadius: 2,
      alignItems: "center",
      fontWeight: 500,
      justifyContent: "center",
      border: `2px solid ${buttonTheme.borderColor}`,
      boxSizing: "border-box",
      color: isLoading ? Colors.CLEAR : foregroundColor,
      cursor: props.disabled ? "mouse" : "pointer",
      ...style,
    }

    return <div className="relative">
      <button
        style={buttonStyle}        
        onClick={isLoading ? undefined : onClick}
        {...props}
      >
        {title}
      </button>
      {isLoading && (
        <div className="centred">
          <Spinner length={20} color={foregroundColor} />
        </div>
      )}
    </div>
  }}</FeedbackProvider>
}
