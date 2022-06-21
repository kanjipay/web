import { useState } from "react";
import { ButtonTheme } from "./ButtonTheme";

export default function IconButton({
  length = 32, borderRadius = 10000, Icon, imageRef, buttonTheme = ButtonTheme.MONOCHROME, style, ...props
}) {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  let backgroundColor;

  if (props.disabled) {
    backgroundColor = buttonTheme.disabledBackgroundColor;
  } else if (isPressed || isHovering) {
    backgroundColor = buttonTheme.pressedBackgroundColor;
  } else {
    backgroundColor = buttonTheme.backgroundColor;
  }

  const foregroundColor = props.disabled
    ? buttonTheme.disabledForegroundColor
    : buttonTheme.foregroundColor;

  const buttonStyle = {
    backgroundColor,
    height: length,
    width: length,
    borderRadius,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: props.disabled ? "mouse" : "pointer",
    ...style,
  };

  return (
    <button
      style={buttonStyle}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      {...props}
    >
      {Icon && <Icon color={foregroundColor} />}
      {imageRef && <img style={{ width: 32, height: 32 }} src={imageRef} alt="" />}
    </button>
  );
}
