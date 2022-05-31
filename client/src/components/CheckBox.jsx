import { useState } from "react";
import Tick from "../assets/icons/Tick";
import { Colors } from "./CircleButton";

export default function CheckBox({ length = 32, color = Colors.BLACK, value, onChange, disabled }) {
  const [isChecked, setIsChecked] = useState(value)

  const checkColor = disabled ? Colors.GRAY_LIGHT : color

  const handleClick = () => {
    if (disabled) { return }
    const newValue = !isChecked
    setIsChecked(newValue)
    onChange(newValue)
  }

  return <div className="CheckBox" onClick={handleClick} style={{
    display: "inline-block",
    position: "relative",
    cursor: disabled ? "mouse" : "pointer",
    border: `2px solid ${checkColor}`,
    width: length,
    height: length,
    boxSizing: "border-box",
    backgroundColor: isChecked ? checkColor : Colors.CLEAR,
  }}>
    <input type="checkbox" style={{
      position: "absolute",
      height: 0,
      width: 0,
      visibility: "hidden",
    }} />
    <Tick length={length - 4} color={isChecked ? Colors.WHITE : Colors.CLEAR} style={{ position: "absolute"}} />
  </div>
}