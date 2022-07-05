import { useState } from "react"
import { Colors } from "../enums/Colors"

export default function NavBarButton({ title, ...props }) {
  const [isPressed, setIsPressed] = useState(false)
  let textColor

  if (props.disabled) {
    textColor = Colors.PRIMARY_LIGHT
  } else if (isPressed) {
    textColor = Colors.PRIMARY_LIGHT_SHADED
  } else {
    textColor = Colors.PRIMARY
  }

  return (
    <button
      style={{
        border: 0,
        padding: 8,
        color: textColor,
        backgroundColor: Colors.WHITE,
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      {...props}
    >
      {title}
    </button>
  )
}
