import { useState } from "react";
import Spinner from "../assets/Spinner";
import { ButtonTheme } from "./CircleButton";

export default function SmallButton({
  buttonTheme = ButtonTheme.PRIMARY,
  title,
  style,
  isLoading = false,
  onClick,
  ...props
}) {
  const [isPressed, setIsPressed] = useState(false);

  let backgroundColor;

  if (props.disabled) {
    console.log("disabled")
    backgroundColor = buttonTheme.disabledBackgroundColor;
  } else if (isPressed) {
    backgroundColor = buttonTheme.pressedBackgroundColor;
  } else {
    backgroundColor = buttonTheme.backgroundColor;
  }

  const foregroundColor = props.disabled
    ? buttonTheme.disabledForegroundColor
    : buttonTheme.foregroundColor;

  const buttonStyle = {
    backgroundColor,
    padding: "8px 12px",
    borderRadius: "1000px",
    border: 0,
    display: "flex",
    outline: "none",
    alignItems: "center",
    justifyContent: "center",
    color: foregroundColor,
    cursor: "pointer",
    ...style,
  };

  return <div className="relative">
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
      isLoading && <div className="centred">
        <Spinner length={20} color={foregroundColor} />
      </div>
    }
  </div>
}