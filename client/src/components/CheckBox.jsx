import { useState } from "react";
import Tick from "../assets/icons/Tick";
import { Colors } from "./CircleButton";

export default function CheckBox({ length = 32, color = Colors.BLACK, value, onChange }) {
  const [isChecked, setIsChecked] = useState(value)

  const handleClick = () => {
    const newValue = !isChecked
    setIsChecked(newValue)
    onChange(newValue)
  }

  return <div className="CheckBox" onClick={handleClick} style={{
    display: "inline-block",
    position: "relative",
    cursor: "pointer",
    border: `2px solid ${color}`,
    width: length,
    height: length,
    boxSizing: "border-box",
    backgroundColor: isChecked ? color : Colors.CLEAR,
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