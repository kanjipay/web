import { useState } from "react";
import Minus from "../assets/icons/Minus";
import Plus from "../assets/icons/Plus";
import { Colors } from "../enums/Colors";
import IconButton from "./IconButton";

export default function Stepper({ value, onChange, minValue = 0, maxValue = 1000 }) {
  const [_value, setValue] = useState(value)

  const handleIncrement = (incrememnt) => {
    const newValue = _value + incrememnt
    onChange(newValue)
    setValue(newValue) 
  }

  return <div style={{ display: "flex" }}>
    <IconButton borderRadius={0} Icon={Minus} disabled={value <= minValue} onClick={() => handleIncrement(-1)} />
    <div style={{ width: 48, height: 32, backgroundColor: Colors.OFF_WHITE_LIGHT, display: "flex", justifyContent: "center", alignItems: "center" }}>
      {value}
    </div>
    <IconButton borderRadius={0} Icon={Plus} disabled={value >= maxValue} onClick={() => handleIncrement(1)} />
  </div>
}