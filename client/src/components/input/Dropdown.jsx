import Popup from "reactjs-popup"
import { MenuItem } from "../../app/dashboard/events/analytics/AnalyticsPage"
import Carat from "../../assets/icons/Carat"
import { Colors } from "../../enums/Colors"

export default function Dropdown({
  optionList,
  name,
  value,
  onChange,
  disabled = false,
  allowsNull = false,
  width = 320,
  position = "bottom left",
  ...props
}) {
  const currOption = optionList.find((option) => option.value === value)
  const trigger = (
    <div
      test-id={`dropdown-${name}`}
      style={{
        display: "flex",
        columnGap: 8,
        width,
        height: 48,
        backgroundColor: Colors.OFF_WHITE_LIGHT,
        alignItems: "center",
        cursor: disabled ? "mouse" : "pointer",
        padding: "0 16px",
        boxSizing: "border-box",
        ...props.style,
      }}
    >
      <Carat length={16} color={Colors.GRAY_LIGHT} />
      <p
        style={{
          color: disabled || !value ? Colors.GRAY_LIGHT : Colors.BLACK,
        }}
      >
        {currOption?.label ?? currOption?.value ?? "Select an option"}
      </p>
    </div>
  )

  const handleSelectOption = (option, close) => {
    if (disabled) {
      return
    }
    onChange({ target: { name, value: option } })
    close()
  }

  if (disabled) {
    return trigger
  } else {
    return (
      <Popup
        trigger={trigger}
        closeOnDocumentClick
        contentStyle={{
          border: `1px solid ${Colors.OFF_WHITE}`,
          backgroundColor: Colors.WHITE,
          width,
          boxSizing: "border-box",
        }}
        position={position}
        arrow={false}
      >
        {(close) => (
          <div>
            {allowsNull && (
              <MenuItem
                title="Leave empty"
                onClick={() => handleSelectOption(null, close)}
                isSelected={!value}
              />
            )}
            {optionList.map((option) => {
              return (
                <MenuItem
                  title={option.label ?? option.value}
                  onClick={() => handleSelectOption(option.value, close)}
                  isSelected={option.value === value}
                />
              )
            })}
          </div>
        )}
      </Popup>
    )
  }
}
