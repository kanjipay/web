import { Colors } from "../enums/Colors"

export default function SquareLabel({
  children,
  backgroundColor = Colors.BLACK,
  foregroundColor = Colors.WHITE,
  fontSize = 15,
  padding = "4px 6px",
  style,
  ...props
}) {
  return (
    <div style={{ display: "inline-block" }}>
      <div
        {...props}
        style={{
          backgroundColor,
          color: foregroundColor,
          fontSize,
          padding,
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          width: "max-content",
          ...style
        }}
      >
        {children}
      </div>
    </div>
  )
}
