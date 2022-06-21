import { useState } from "react";
import Tick from "../assets/icons/Tick";
import { Colors } from "../enums/Colors";

export default function CheckBox({ length = 32, color = Colors.BLACK, name, value, onChange, disabled = false }) {
  const checkColor = disabled ? Colors.GRAY_LIGHT : color
  const [hasClickedRecently, setHasClickedRecently] = useState(false)

  console.log("rerender: ", value)

  const handleClick = () => {
    if (hasClickedRecently || disabled) { return }

    setHasClickedRecently(true)

    setTimeout(() => {
      setHasClickedRecently(false)
    }, 200)
    console.log(value)
    onChange({ target: { name, value: !value}})
  }

  return <div
    onClick={handleClick} style={{
    display: "inline-block",
    position: "relative",
    cursor: disabled ? "mouse" : "pointer",
    border: `2px solid ${checkColor}`,
    width: length,
    height: length,
    boxSizing: "border-box",
    backgroundColor: value ? checkColor : Colors.CLEAR,
  }}>
    <input 
      type="checkbox" 
      name={name}
      style={{
        position: "absolute",
        visibility: "hidden",
      }} />
    <Tick length={length - 4} color={value ? Colors.WHITE : Colors.CLEAR} style={{ position: "absolute"}} />
  </div>
}