import { Colors } from "./CircleButton";

export default function Bubble({
  children,
  backgroundColor = Colors.OFF_WHITE_LIGHT,
  foregroundColor = Colors.BLACK,
  fontSize = 15,
  padding = "2px 6px",
  ...props
}) {
  return <div {...props} style={{
    backgroundColor,
    color: foregroundColor,
    borderRadius: 1000,
    fontSize,
    padding,
    fontWeight: 500,
    display: "flex",
    alignItems: "center"
  }}>
    {children}
  </div>
}