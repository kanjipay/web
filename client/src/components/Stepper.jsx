import Minus from "../assets/icons/Minus"
import Plus from "../assets/icons/Plus"
import { Colors } from "../enums/Colors"
import IconButton from "./IconButton"

export default function Stepper({
  value,
  onChange,
  minValue = 0,
  maxValue = 1000,
}) {
  const handleIncrement = (incrememnt) => onChange(value + incrememnt)

  return (
    <div style={{ display: "flex" }}>
      <IconButton
        borderRadius={0}
        Icon={Minus}
        disabled={value <= minValue}
        onClick={() => handleIncrement(-1)}
        test-id="stepper-decrement-button"
      />
      <div
        test-id="stepper-value"
        style={{
          width: 48,
          height: 32,
          backgroundColor: Colors.OFF_WHITE_LIGHT,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {value}
      </div>
      <IconButton
        borderRadius={0}
        Icon={Plus}
        disabled={value >= maxValue}
        onClick={() => handleIncrement(1)}
        test-id="stepper-increment-button"
      />
    </div>
  )
}
