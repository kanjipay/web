import { useState } from 'react'
import { ButtonTheme } from './CircleButton'
import './MainButton.css'

export default function MainButton({ buttonTheme = ButtonTheme.PRIMARY, title, sideMessage, style, ...props }) {
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
    height: "48px",
    width: "100%",
    borderRadius: "16px",
    border: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: foregroundColor,
    ...style
  }

  return <div className="MainButton">
    <button
      style={buttonStyle}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      {...props}
    >
      {title}
    </button>
    { sideMessage && <div className="MainButton__sideMessage header-xs">{sideMessage}</div> }
  </div>

}