import { Colors } from "../enums/Colors"

export default function SegmentedControl({ values, value, onChange }) {
  const gridTemplateColumns = values.map((value) => "1fr").join(" ")

  const handleValueClick = (value) => {
    onChange({ target: { value } })
  }

  return (
    <div
      style={{
        backgroundColor: Colors.OFF_WHITE_LIGHT,
        display: "grid",
        gridTemplateColumns,
        columnGap: 8,
        padding: 8,
        boxSizing: "border-box",
        height: 48,
      }}
    >
      {values.map((listValue) => {
        const isCurrValue = listValue === value

        return (
          <button
            style={{
              flexGrow: 100,
              backgroundColor: isCurrValue
                ? Colors.BLACK
                : Colors.OFF_WHITE_LIGHT,
              color: isCurrValue ? Colors.WHITE : Colors.BLACK,
              cursor: "pointer",
            }}
            onClick={() => handleValueClick(listValue)}
          >
            {listValue}
          </button>
        )
      })}
    </div>
  )
}
