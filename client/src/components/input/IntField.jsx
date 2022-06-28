import { Colors } from "../../enums/Colors"

export function Field({ 
  value, 
  onChange,
  regex = /.*/, 
  maxChars = 140, 
  disregardInCharCountRegex = null, 
  onSubmit, 
  ...props
}) {
  const validateKey = event => {
    const currentValue = event.target.value ?? ""
    const currPosition = event.target.selectionStart

    const proposedValue = currentValue.slice(0, currPosition) + event.key + currentValue.slice(currPosition)

    let charsToCount = disregardInCharCountRegex ? proposedValue.replace(disregardInCharCountRegex, "") : proposedValue

    if (event.key === "Enter") {
      onSubmit(event)
    }

    if (!regex.test(proposedValue) || charsToCount.length > maxChars) {
      event.preventDefault()
    }
  }

  const textInputStyle = {
    backgroundColor: Colors.OFF_WHITE_LIGHT,
    color: props.disabled ? Colors.GRAY : Colors.BLACK,
    boxSizing: "border-box",
    padding: 12,
    width: "100%",
  }

  return <input
    style={textInputStyle}
    onKeyPress={validateKey}
    test-id={`field-${props.name}`}
    value={value}
    onChange={onChange}
    {...props}
  />
}

export function FieldDecorator({ field, prefix, suffix }) {
  const endingsStyle = {
    padding: "0 12px",
    display: "flex",
    alignItems: "center",
    color: Colors.GRAY_LIGHT,
    backgroundColor: Colors.OFF_WHITE
  }

  return <div style={{ display: "flex" }}>
    { prefix && <div style={endingsStyle}>{prefix}</div> }
    { field }
    { suffix && <div style={endingsStyle}>{suffix}</div> }
  </div>
}

export function IntField({ 
  value, 
  onChange, 
  maxChars = 20, 
  allowsNegative = false,
  ...props
}) {
  const regex = new RegExp(`^${allowsNegative ? "\\-{0,1}" : ""}[0-9]*$`, "g")

  return <Field 
    value={value} 
    onChange={onChange} 
    maxChars={maxChars}
    type="number"
    regex={regex}
    onWheel={(e) => e.target.blur()} 
    disregardInCharCountRegex={/[\-]/}
    {...props}
  />
}

export function FloatField({ 
  value, 
  onChange, 
  maxChars = 20, 
  allowsNegative = false, 
  maxDecimalPlaces = 2,
  ...props
}) {
  const regex = new RegExp(`^${allowsNegative ? "\\-{0,1}" : ""}([0-9]*\\.{0,1}[0-9]{0,${maxDecimalPlaces}})$`)

  return <Field
    value={value}
    onChange={onChange}
    maxChars={maxChars}
    type="number"
    regex={regex}
    onWheel={(e) => e.target.blur()} 
    disregardInCharCountRegex={/[\.\-]/}
    {...props}
  />
}

