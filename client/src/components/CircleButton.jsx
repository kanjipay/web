import { useState } from "react";

export class Colors {
  static PRIMARY = "#2695ff";
  static PRIMARY_SHADED = "#2182df";
  static PRIMARY_LIGHT = "#ebf5ff";
  static PRIMARY_LIGHT_SHADED = "#dfefff";
  static PRIMARY_DARK = "#051320";
  static OFF_WHITE = "#ebebeb";
  static OFF_WHITE_LIGHT = "#f8f8f8";
  static GRAY = "#444";
  static GRAY_LIGHT = "#888";
  static WHITE = "#ffffff";
  static BLACK = "#000000";
  static OFF_BLACK = "#181818";
  static OFF_BLACK_LIGHT = "#333333";
  static RED = "#ff0000";
  static RED_LIGHT = "#FFE6E6";
  static GREEN = "#008000";
  static LIGHT_GREEN = "#E6F3E6";
  static CLEAR = "#FFFFFF00"
}

export class ButtonTheme {
  static PRIMARY = new ButtonTheme(
    Colors.PRIMARY,
    Colors.PRIMARY_SHADED,
    Colors.WHITE
  );
  static SECONDARY = new ButtonTheme(
    Colors.PRIMARY_LIGHT,
    Colors.PRIMARY_LIGHT_SHADED,
    Colors.PRIMARY
  );
  static NAVBAR = new ButtonTheme(
    Colors.WHITE,
    Colors.OFF_WHITE_LIGHT,
    Colors.BLACK
  );

  static MONOCHROME = new ButtonTheme(
    Colors.BLACK,
    Colors.OFF_BLACK,
    Colors.WHITE
  )

  static MONOCHROME_OUTLINED = new ButtonTheme(
    Colors.WHITE,
    Colors.OFF_WHITE_LIGHT,
    Colors.BLACK,
    Colors.BLACK
  )
  
  static DESTRUCTIVE = new ButtonTheme(Colors.RED, Colors.RED, Colors.WHITE);

  constructor(backgroundColor, pressedBackgroundColor, foregroundColor, borderColor = Colors.CLEAR) {
    this.backgroundColor = backgroundColor;
    this.pressedBackgroundColor = pressedBackgroundColor;
    this.foregroundColor = foregroundColor;
    this.borderColor = borderColor
  }

  disabledBackgroundColor = Colors.GRAY_LIGHT;
  disabledForegroundColor = Colors.WHITE;
}

export default function IconButton({
  length = 32,
  borderRadius = 10000,
  Icon,
  imageRef,
  buttonTheme = ButtonTheme.MONOCHROME,
  style,
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
    height: length,
    width: length,
    borderRadius,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    ...style,
  };

  return (
    <button
      style={buttonStyle}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      {...props}
    >
      { Icon && <Icon color={foregroundColor} /> }
      { imageRef && <img style={{ width: 32, height: 32 }} src={imageRef} alt="" />}
    </button>
  );
}
