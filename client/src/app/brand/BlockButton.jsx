import { useState } from "react";
import Spinner from "../../assets/Spinner";
import { Colors } from "../../enums/Colors";

export default function BlockButton({
  title,
  style,
  isLoading = false,
  onClick,
  ...props
}) {
  const [isPressed, setIsPressed] = useState(false);

  let backgroundColor;

  if (props.disabled) {
    backgroundColor = Colors.GRAY_LIGHT;
  } else if (isPressed) {
    backgroundColor = Colors.OFF_WHITE_LIGHT
  } else {
    backgroundColor = Colors.WHITE
  }

  const foregroundColor = props.disabled
    ? Colors.GRAY
    : Colors.BLACK

  const buttonStyle = {
    backgroundColor,
    height: "48px",
    width: "100%",
    border: 0,
    display: "flex",
    outline: "none",
    alignItems: "center",
    justifyContent: "center",
    color: foregroundColor,
    fontFamily: "Oswald, Roboto, sans-serif",
    fontWeight: 500,
    cursor: props.disabled ? "mouse" : "pointer",
    ...style,
  };

  return (
    <div className="MainButton relative">
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
      {isLoading && (
        <div className="centred">
          <Spinner length={32} color={foregroundColor} />
        </div>
      )}
    </div>
  );
}
