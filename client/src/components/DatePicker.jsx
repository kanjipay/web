import { format, addDays } from "date-fns"
import { useState } from "react"
import Minus from "../assets/icons/Minus"
import Plus from "../assets/icons/Plus"
import { Colors } from "../enums/Colors"
import CheckBox from "./CheckBox"
import IconButton from "./IconButton"
import Spacer from "./Spacer"

const defaultDateFormatter = (date) =>
  date ? format(date, "EEE") : "Invalid date"

export default function DatePicker({
  name,
  value,
  onChange,
  showsDate = true,
  showsTime = true,
  dateFormatter = defaultDateFormatter,
  disabled = false,
  required = true,
}) {
  const inputStyle = {
    height: 48,
    backgroundColor: Colors.CLEAR,
    boxSizing: "border-box",
    display: "inline-block",
    width: 32,
    textAlign: "center",
  }

  function dateToValues(date) {
    return {
      minute: prependZeros(date.getMinutes().toString()),
      hour: prependZeros(date.getHours().toString()),
      day: prependZeros(date.getDate().toString()),
      month: prependZeros((date.getMonth() + 1).toString()),
      year: date.getFullYear().toString().slice(-2),
    }
  }

  function changeValues(values) {
    setValues(values)
    const date = valuesToDate(values)
    if (!date) {
      return
    }
    onChange({ target: { name, value: date } })
  }

  function valuesToDate(values) {
    const valuesAsInts = {}

    for (const [name, valueAsString] of Object.entries(values)) {
      const valueAsInt = isNaN(valueAsString)
        ? 0
        : name === "year"
        ? parseInt("20" + valueAsString, 10)
        : parseInt(valueAsString, 10)
      if (!isValid(name, valueAsInt)) {
        return null
      }
      valuesAsInts[name] = valueAsInt
    }

    try {
      const { year, month, day, hour, minute } = valuesAsInts
      const date = new Date(year, month - 1, day, hour, minute)

      if (date.getDate() !== day) {
        return null
      }
      return date
    } catch (err) {
      return null
    }
  }

  function prependZeros(string, isFromInput = false) {
    if (isFromInput && string.replace("0", "") === "") {
      return string
    }
    return ("0" + string).slice(-2)
  }

  const initialDate = new Date()
  initialDate.setMinutes(0)

  const [values, setValues] = useState(dateToValues(value ? value : initialDate))

  const separator = <p style={{ color: "#aaa" }}>/</p>

  const onChangeValue = (event) => {
    const { name, value } = event.target

    if (isValidInput(event)) {
      changeValues({ ...values, [name]: prependZeros(value, true) })
    }
  }

  function isValid(name, valueAsInt) {
    switch (name) {
      case "year":
        return true
      case "month":
        return valueAsInt >= 1 && valueAsInt <= 12
      case "day":
        return valueAsInt >= 1 && valueAsInt <= 31
      case "hour":
        return valueAsInt >= 0 && valueAsInt <= 23
      case "minute":
        return valueAsInt >= 0 && valueAsInt <= 59
      default:
        return false
    }
  }

  function isValidInput(event) {
    const { name, value } = event.target

    if (value === "" || value === "0") {
      return true
    } else {
      const cleansedValue = value.replace("0", "")
      const isTwoDigitNumber = cleansedValue.length < 3 && !isNaN(value)

      if (isTwoDigitNumber) {
        const valueAsInt = parseInt(value, 10)
        return isValid(name, valueAsInt)
      } else {
        return false
      }
    }
  }

  const handleClickInput = (event) => {
    if (event.target.value.length > 0) {
      event.target.select()
    }
  }

  function generateProps(
    name,
    placeholder,
    label = name[0].toUpperCase() + name.slice(1)
  ) {
    return {
      name,
      label,
      style: inputStyle,
      onClick: handleClickInput,
      value: values[name],
      onChange: onChangeValue,
      placeholder,
      disabled,
      "test-id": `date-picker-field-${name}`,
    }
  }

  function incrementDate(increment) {
    const currDate = valuesToDate(values)
    if (!currDate) {
      return
    }
    const newDate = addDays(currDate, increment)
    const newValues = dateToValues(newDate)
    changeValues(newValues)
  }

  function generateDateLabel() {
    const date = valuesToDate(values)
    return dateFormatter(date)
  }

  const contents = (
    <div
      test-id={`date-picker-component-${name}`}
      style={{
        height: 48,
        display: "flex",
        columnGap: 12,
        alignItems: "center",
        boxSizing: "border-box",
      }}
    >
      {showsDate && (
        <div
          style={{
            height: 48,
            display: "flex",
            backgroundColor: "black",
            alignItems: "center",
          }}
        >
          <input style={{ width: 0, height: 0 }} disabled={disabled} />
          <IconButton
            Icon={Minus}
            style={{ height: 48, width: 32, borderRadius: 0 }}
            onClick={() => incrementDate(-1)}
            test-id="date-picker-decrement"
            disabled={disabled}
          />
          <div
            style={{
              height: 48,
              display: "flex",
              alignItems: "center",
              backgroundColor: Colors.OFF_WHITE_LIGHT,
            }}
          >
            <input {...generateProps("day", "DD")} />
            {separator}
            <input {...generateProps("month", "MM")} />
            {separator}
            <input {...generateProps("year", "YY")} />
          </div>

          <IconButton
            Icon={Plus}
            style={{ height: 48, width: 32, borderRadius: 0 }}
            onClick={() => incrementDate(1)}
            test-id="date-picker-increment"
            disabled={disabled}
          />
        </div>
      )}

      {showsTime && (
        <div
          style={{
            height: 48,
            display: "flex",
            alignItems: "center",
            backgroundColor: Colors.OFF_WHITE_LIGHT,
            padding: "0 4px",
          }}
        >
          <input {...generateProps("hour", "HH")} />
          <p style={{ color: "#aaa" }}>:</p>
          <input {...generateProps("minute", "mm")} />
        </div>
      )}

      <div className="flex-spacer"></div>
      <p>{generateDateLabel()}</p>
    </div>
  )

  const handleCheckBoxChange = (event) => {
    console.log("handleCheckBox")
    const newValue = event.target.value ? null : new Date()
    onChange({ target: { name, value: newValue } })

    setValues(dateToValues(new Date()))
  }

  return (
    <div test-id={`date-picker-${name}`}>
      {required ? (
        contents
      ) : (
        <div>
          <input
            style={{ width: 0, height: 0, display: "none" }}
            disabled={disabled}
          />
          <div style={{ display: "flex", columnGap: 16, alignItems: "center" }}>
            <CheckBox
              value={!value}
              onChange={handleCheckBoxChange}
              disabled={disabled}
              name={`date-picker-isblank`}
            />
            <p>Leave blank</p>
          </div>
          {value && (
            <div>
              <Spacer y={2} />
              {contents}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
