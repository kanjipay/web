import React, { useEffect, useState } from "react"
import { Colors } from "../enums/Colors"
import CheckBox from "./CheckBox"
import Spacer from "./Spacer"

const textInputStyle = {
  backgroundColor: Colors.OFF_WHITE_LIGHT,
  color: Colors.BLACK,
  boxSizing: "border-box",
  padding: 12,
  width: "100%",
}

export function InputGroup({
  name,
  label,
  explanation,
  input,
  value,
  onChange,
  isShowingValidationErrors,
  validators,
  decorator,
  required,
  disabled,
  visible,
  onSubmit,
}) {
  const Input = React.cloneElement(input, {
    name,
    value,
    onChange,
    disabled,
    required,
    onSubmit,
  })

  let inputArea

  if (decorator) {
    inputArea = React.cloneElement(decorator, { field: Input })
  } else {
    inputArea = Input
  }

  const [validationMessage, setValidationMessage] = useState("")

  useEffect(() => {
    const message = validators.reduce((validationMessage, validator) => {
      const { isValid, message } = validator(value)

      if (!isValid && message) {
        validationMessage += message
      }

      return validationMessage
    }, "")

    setValidationMessage(message)
  }, [validators, value])

  return visible ?
    input.type === CheckBox ?
      <label>
        <div style={{ display: "flex", columnGap: 16, alignItems: "center" }}>
          {inputArea}
          <p className="header-xs">{label}</p>
        </div>
        {validationMessage.length > 0 && isShowingValidationErrors && (
          <div>
            <Spacer y={1} />
            <p className="text-caption" style={{ color: Colors.RED }}>
              {validationMessage}
            </p>
          </div>
        )}
        <Spacer y={3} />
      </label> :
      <label>
        <span className="header-xs">
          {label + (required ? "" : " (optional)")}
        </span>
        {explanation ? (
          <div>
            <Spacer y={2} />
            <p className="text-body-faded">{explanation}</p>
            <Spacer y={2} />
          </div>
        ) : (
          <Spacer y={1} />
        )}

        {inputArea}
        {validationMessage.length > 0 && isShowingValidationErrors && (
          <div>
            <Spacer y={1} />
            <p className="text-caption" style={{ color: Colors.RED }}>
              {validationMessage}
            </p>
          </div>
        )}
        <Spacer y={3} />
      </label> :
    <div></div>
}

export default function TextField({
  placeholder,
  style,
  prefix = "",
  suffix = "",
  onChange,
  value = "",
  ...props
}) {
  const inputStyle = {
    height: 48,
    ...textInputStyle,
    ...style,
    flexGrow: 100,
  }

  const endingsStyle = {
    padding: "0 16px",
    display: "flex",
    alignItems: "center",
    color: Colors.GRAY_LIGHT,
    backgroundColor: Colors.OFF_WHITE,
  }

  return (
    <div style={{ display: "flex" }}>
      {prefix && <div style={endingsStyle}>{prefix}</div>}
      <input
        placeholder={placeholder}
        style={inputStyle}
        {...props}
        value={value}
        onChange={onChange}
      />
      {suffix && <div style={endingsStyle}>{suffix}</div>}
    </div>
  )
}

export function TextArea({ placeholder, style, ...props }) {
  return (
    <textarea
      test-id={`textarea-${props.name}`}
      spellCheck={true}
      placeholder={placeholder}
      style={{
        ...textInputStyle,
        border: 0,
        height: 100,
        maxWidth: "100%",
        ...style,
      }}
      {...props}
    />
  )
}
