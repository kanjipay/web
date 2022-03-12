import { useState } from 'react'
import Spinner from '../assets/Spinner'
import { ButtonTheme, Colors } from './CircleButton'
import './MainButton.css'

export default function MainButton({
  buttonTheme = ButtonTheme.PRIMARY,
  title,
  sideMessage,
  style,
  isLoading = false,
  onClick,
  ...props
}) {
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
    outline: "none",
    alignItems: "center",
    justifyContent: "center",
    color: foregroundColor,
    ...style
  }

  return <div className="MainButton relative">
    <button
      style={buttonStyle}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onClick={isLoading ? undefined : onClick}
      {...props}
    >
      {isLoading ? "" : title}
    </button>
    {
      isLoading && <div className='centred'>
        <Spinner length={32} color={Colors.WHITE} />
      </div>
    }

    { sideMessage && <div className="MainButton__sideMessage header-xs">{sideMessage}</div> }
  </div>

}