import { useState } from "react"

export class Colors {
  static PRIMARY = "#2695ff"
  static PRIMARY_SHADED = "#2182df"
  static PRIMARY_LIGHT = "#ebf5ff"
  static PRIMARY_LIGHT_SHADED = "#dfefff"
  static PRIMARY_DARK = "#051320"
  static OFF_WHITE = "#ebebeb"
  static OFF_WHITE_LIGHT = "#f8f8f8"
  static GRAY = "#444"
  static GRAY_LIGHT = "#888"
  static WHITE = "#ffffff"
  static BLACK = "#000000"
}

export class ButtonTheme {
  static PRIMARY = new ButtonTheme(Colors.PRIMARY, Colors.PRIMARY_SHADED, Colors.WHITE)
  static SECONDARY = new ButtonTheme(Colors.PRIMARY_LIGHT, Colors.PRIMARY_LIGHT_SHADED, Colors.PRIMARY)
  static NAVBAR = new ButtonTheme(Colors.WHITE, Colors.OFF_WHITE_LIGHT, Colors.PRIMARY)

  constructor(backgroundColor, pressedBackgroundColor, foregroundColor) {
    this.backgroundColor = backgroundColor
    this.pressedBackgroundColor = pressedBackgroundColor
    this.foregroundColor = foregroundColor
  }

  disabledBackgroundColor = Colors.OFF_WHITE_LIGHT
  disabledForegroundColor = Colors.GRAY_LIGHT
}

export default function CircleButton({ Icon, src, buttonTheme, ...props }) {
  const [isPressed, setIsPressed] = useState(false)

  let backgroundColor

  if (props.disabled) {
    backgroundColor = buttonTheme.disabledBackgroundColor
  } else if (isPressed) {
    backgroundColor = buttonTheme.pressedBackgroundColor
  } else {
    backgroundColor = buttonTheme.backgroundColor
  }

  const foregroundColor = props.disabled ? buttonTheme.disabledForegroundColor : buttonTheme.foregroundColor

  const buttonStyle = {
    backgroundColor,
    height: "32px",
    width: "32px",
    borderRadius: "16px",
    border: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }

  const iconSize = 16
  const iconStyle = { height: iconSize, width: iconSize, objectFit: "contain" }

  return (
    <button
      style={buttonStyle}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      {...props}
    >
      <Icon style={iconStyle} color={foregroundColor} />
    </button>
  )
}