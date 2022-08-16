import { useState } from "react"
import Spinner from "../assets/Spinner"
import { ButtonTheme } from "./ButtonTheme"
import "./MainButton.css"
import { Colors } from "../enums/Colors"

export default function MainButton({
  buttonTheme = ButtonTheme.MONOCHROME,
  title,
  sideMessage,
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
    height: "48px",
    width: "100%",
    border: `1px solid ${buttonTheme.borderColor}`,
    display: "flex",
    outline: "none",
    boxSizing: "border-box",
    alignItems: "center",
    justifyContent: "center",
    color: foregroundColor,
    cursor: props.disabled ? "mouse" : "pointer",
    ...style,
  }

  return (
    <div className="MainButton relative">
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
          <Spinner length={32} color={foregroundColor} />
        </div>
      )}

      {sideMessage && (
        <div
          style={{
            position: "absolute",
            height: "100%",
            padding: "0px 16px",
            display: "flex",
            alignItems: "center",
            top: 0,
            right: 0,
            fontWeight: 500,
            color: Colors.WHITE,
            backgroundColor: Colors.OFF_BLACK_LIGHT,
            cursor: "pointer"
          }}
          onClick={isLoading ? undefined : onClick}
        >
          {sideMessage}
        </div>
      )}
    </div>
  )
}
