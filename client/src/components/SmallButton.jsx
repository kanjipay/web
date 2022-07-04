import { useState } from "react"
import Spinner from "../assets/Spinner"
import { ButtonTheme } from "./ButtonTheme"

export default function SmallButton({
  buttonTheme = ButtonTheme.MONOCHROME,
  title,
  style,
  isLoading = false,
  onClick,
  ...props
}) {
  const [isPressed, setIsPressed] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

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
    padding: "8px 16px",
    display: "flex",
    outline: "none",
    alignItems: "center",
    justifyContent: "center",
    border: `1px solid ${buttonTheme.borderColor}`,
    boxSizing: "border-box",
    color: foregroundColor,
    cursor: props.disabled ? "mouse" : "pointer",
    ...style,
  }

  return (
    <div className="relative">
      <button
        style={buttonStyle}
        className="header-xs"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onTouchStart={() => setIsPressed(true)}
        onTouchEnd={() => setIsPressed(false)}
        onClick={isLoading ? undefined : onClick}
        {...props}
      >
        {isLoading ? "" : title}
      </button>
      {isLoading && (
        <div className="centred">
          <Spinner length={20} color={foregroundColor} />
        </div>
      )}
    </div>
  )
}
