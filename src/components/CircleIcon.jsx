import { Colors } from "./CircleButton";

export default function CircleIcon({
  Icon,
  length = 32,
  backgroundColor = Colors.OFF_WHITE_LIGHT,
  foregroundColor = Colors.BLACK,
  style,
  ...props
}) {
  const backgroundStyle = {
    backgroundColor,
    height: length,
    width: length,
    borderRadius: length / 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    ...style
  }

  return (
    <div style={backgroundStyle} {...props}>
      <Icon color={foregroundColor} style={{ height: length, width: length, objectFit: "contain" }} />
    </div>
  )
}