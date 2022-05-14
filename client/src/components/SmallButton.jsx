import { useState } from "react";
import Spinner from "../assets/Spinner";
import { ButtonTheme } from "./CircleButton";

export default function SmallButton({
  buttonTheme = ButtonTheme.MONOCHROME,
  title,
  style,
  isLoading = false,
  onClick,
  ...props
}) {
  const [isPressed, setIsPressed] = useState(false);

  let backgroundColor;

  if (props.disabled) {
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
    padding: "8px 16px",
    display: "flex",
    outline: "none",
    alignItems: "center",
    justifyContent: "center",
    border: `1px solid ${buttonTheme.borderColor}`,
    boxSizing: "border-box",
    color: foregroundColor,
    cursor: props.disabled ? "mouse" : "pointer",
    font: "500 1em Oswald, Roboto, sans-serif",
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