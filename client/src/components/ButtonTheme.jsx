import { Colors } from "../enums/Colors"

export class ButtonTheme {
  static PRIMARY = new ButtonTheme(
    Colors.PRIMARY,
    Colors.PRIMARY_SHADED,
    Colors.WHITE
  )
  static SECONDARY = new ButtonTheme(
    Colors.PRIMARY_LIGHT,
    Colors.PRIMARY_LIGHT_SHADED,
    Colors.PRIMARY
  )
  static NAVBAR = new ButtonTheme(
    Colors.WHITE,
    Colors.OFF_WHITE_LIGHT,
    Colors.BLACK
  )

  static MONOCHROME = new ButtonTheme(
    Colors.BLACK,
    Colors.OFF_BLACK_LIGHT,
    Colors.WHITE
  )

  static MONOCHROME_REVERSED = new ButtonTheme(
    Colors.WHITE,
    Colors.OFF_WHITE_LIGHT,
    Colors.BLACK
  )

  static MONOCHROME_OUTLINED = new ButtonTheme(
    Colors.CLEAR,
    "#00000022",
    Colors.BLACK,
    Colors.BLACK
  )

  static MONOCHROME_OUTLINED_REVERSE = new ButtonTheme(
    Colors.CLEAR,
    "#FFFFFF22",
    Colors.WHITE,
    Colors.WHITE
  )

  static CLEAN = new ButtonTheme(
    Colors.WHITE,
    Colors.OFF_WHITE_LIGHT,
    Colors.BLACK
  )

  static DESTRUCTIVE = new ButtonTheme(
    Colors.RED_LIGHT,
    Colors.RED_LIGHT,
    Colors.RED
  )

  constructor(
    backgroundColor,
    pressedBackgroundColor,
    foregroundColor,
    borderColor = Colors.CLEAR
  ) {
    this.backgroundColor = backgroundColor
    this.pressedBackgroundColor = pressedBackgroundColor
    this.foregroundColor = foregroundColor
    this.borderColor = borderColor
  }

  disabledBackgroundColor = Colors.GRAY_LIGHT
  disabledForegroundColor = Colors.WHITE
}
