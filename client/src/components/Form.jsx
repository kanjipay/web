import { useEffect, useState } from "react"
import { Colors } from "../enums/Colors"
import { InputGroup } from "./Input"
import { Field } from "./input/IntField"
import MainButton from "./MainButton"
import ResultBanner, { ResultType } from "./ResultBanner"
import Spacer from "./Spacer"

function camelCaseToWords(string) {
  const lowercaseWords = string
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toLowerCase())

  return lowercaseWords[0].toUpperCase() + lowercaseWords.slice(1)
}

export function generateValidator(validatorFunc, message) {
  return (value) => {
    const isValid = validatorFunc(value)

    return {
      isValid,
      message: isValid ? null : message,
    }
  }
}

export default function Form({
  initialDataSource = {},
  validators = [],
  formGroupData,
  onSubmit,
  submitTitle,
  disabled = false,
  isFormLoading = false,
  style,
  ...props
}) {
  const allItems = (Array.isArray(formGroupData) ? formGroupData : formGroupData({})).flatMap(
    (formGroupDatum) => formGroupDatum.items
  )

  const initialData = allItems.reduce((groupInitialData, item) => {
    const { name } = item
    groupInitialData[name] = initialDataSource[name]

    return groupInitialData
  }, {})

  const [data, setData] = useState(initialData)

  function getFormGroupData() {
    if (Array.isArray(formGroupData)) {
      return formGroupData
    } else {
      return formGroupData(data ?? {})
    }
  }

  const [validationMessage, setValidationMessage] = useState("")
  
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [isShowingValidationErrors, setIsShowingValidationErrors] =
    useState(false)

  useEffect(() => {
    const formMessage = validators.reduce((formMessage, validator) => {
      const { isValid, message } = validator(data)

      if (!isValid && message) {
        formMessage += message
      }

      return formMessage
    }, "")

    setValidationMessage(formMessage)
  }, [data, validators])

  function areValidationErrors() {
    const areItemLevelValidationErrors = allItems.some((item) => {
      const { name, validators } = item
      const value = data[name]

      return (
        validators && validators.some((validator) => !validator(value).isValid)
      )
    })

    const areFormLevelValidationErrors = validators.some(
      (validator) => !validator(data).isValid
    )

    return areItemLevelValidationErrors || areFormLevelValidationErrors
  }

  function areAllRequiredFieldsPopulated() {
    return allItems.every((item) => {
      const { name, required } = item
      const value = data[name]

      return (value != null && value !== "") || required === false
    })
  }

  function showResultBanner(result) {
    setResult(result)
    setTimeout(() => setResult(null), 5000)
  }

  const handleSubmit = (e) => {
    if (!areAllRequiredFieldsPopulated()) {
      return
    }

    if (areValidationErrors()) {
      setIsShowingValidationErrors(true)

      showResultBanner({
        resultType: ResultType.ERROR,
        message: "One or more incorrect values (see above)",
      })

      return
    }

    setIsLoading(true)

    onSubmit(data).then((result) => {
      setIsLoading(false)
      showResultBanner(result)
    })
  }

  const onChange = (event) => {
    const { name, value } = event.target
    setData({ ...data, [name]: value })
  }

  return (
    <div style={style} {...props}>
      {getFormGroupData().map((formGroupDatum, i) => {
        return (
          <FormGroup
            key={i}
            formGroupDatum={formGroupDatum}
            onSubmit={(event) => handleSubmit(data)}
            data={data}
            isShowingValidationErrors={isShowingValidationErrors}
            onChange={onChange}
          />
        )
      })}
      <MainButton
        title={submitTitle}
        onClick={handleSubmit}
        disabled={disabled || !areAllRequiredFieldsPopulated()}
        isLoading={isFormLoading || isLoading}
        test-id={`form-submit-${submitTitle.toLowerCase().replace(" ", "-")}`}
        type="submit"
      />
      {result && (
        <div>
          <Spacer y={2} />
          <ResultBanner
            resultType={result.resultType}
            message={result.message}
          />
        </div>
      )}
      {validationMessage.length > 0 && isShowingValidationErrors && (
        <div>
          <Spacer y={3} />
          <p className="text-body" style={{ color: Colors.RED }}>
            {validationMessage}
          </p>
        </div>
      )}
    </div>
  )
}

function FormGroup({
  formGroupDatum,
  data,
  isShowingValidationErrors,
  onChange,
  onSubmit,
}) {
  const { title, explanation, items } = formGroupDatum

  return (
    <div>
      {title && (
        <div>
          <h2 className="header-s">{title}</h2>
          <Spacer y={3} />
        </div>
      )}

      {explanation && (
        <div>
          <p className="text-body-faded">{explanation}</p>
          <Spacer y={3} />
        </div>
      )}

      {items.map((item) => {
        const {
          name,
          label,
          explanation,
          input,
          validators,
          decorator,
          required,
          visible,
          disabled,
        } = item

        const isVisible = visible ?? true
        const isRequired = isVisible ? (required ?? true) : false

        return (
          <InputGroup
            key={item.name}
            onSubmit={onSubmit}
            name={name}
            label={label ?? camelCaseToWords(name)}
            validators={validators ?? []}
            isShowingValidationErrors={isShowingValidationErrors}
            explanation={explanation}
            input={input ?? <Field />}
            value={data[name]}
            disabled={disabled ?? false}
            visible={isVisible}
            decorator={decorator}
            onChange={onChange}
            required={isRequired}
          />
        )
      })}
    </div>
  )
}
