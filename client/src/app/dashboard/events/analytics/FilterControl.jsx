import { Colors } from "../../../../enums/Colors";
import Popup from "reactjs-popup";
import Cross from "../../../../assets/icons/Cross";
import CheckBox from "../../../../components/CheckBox";
import { popupProps } from "./AnalyticsPage";
import { MenuItem } from "./MenuItem";

export function FilterControl({ filterDatum, onChange, filtersListData }) {
  const labelStyle = {
    height: "100%",
    backgroundColor: Colors.OFF_WHITE,
    padding: "0 8px",
    cursor: "pointer",
  };

  const { property, values } = filterDatum;

  const shouldShowValue = !!filterDatum.property;

  const handleClickFilter = (filtersListDatum, close) => {
    const { name } = filtersListDatum;

    if (name !== filterDatum.name) {
      onChange({ property: name, values: [] });
    }

    close();
  };

  const handleClickFilterValue = (valueDatum) => {
    const { isSelected } = valueDatum;
    const currValues = filterDatum.values;
    const newValues = isSelected
      ? currValues.filter((v) => v.id !== valueDatum.id)
      : [...currValues, valueDatum];
    onChange({ property: filterDatum.property, values: newValues });
  };

  return (
    <div
      style={{
        height: 48,
        backgroundColor: Colors.OFF_WHITE_LIGHT,
        boxSizing: "border-box",
        alignItems: "center",
        padding: "8px 0px 8px 8px",
        display: "flex",
        columnGap: 8,
      }}
    >
      <Popup
        trigger={<button className="text-caption" style={labelStyle}>
          {property ?? "Select property"}
        </button>}
        {...popupProps}
      >
        {(close) => {
          return filtersListData.map((filtersListDatum) => {
            const { name, isSelected } = filtersListDatum;
            return (
              <MenuItem
                key={name}
                title={name}
                onClick={isSelected
                  ? null
                  : () => handleClickFilter(filtersListDatum, close)} />
            );
          });
        }}
      </Popup>

      {shouldShowValue && "="}
      {shouldShowValue && (
        <Popup
          trigger={<button
            className="text-caption"
            style={{ ...labelStyle, flexShrink: 100 }}
          >
            {values.length > 0
              ? values.map((v) => v.title).join(", ")
              : "Select value(s)"}
          </button>}
          {...popupProps}
        >
          {(close) => {
            return filtersListData
              .find(
                (filtersListDatum) => filtersListDatum.name === filterDatum.property
              )
              .values.map((valueDatum) => {
                return (
                  <div
                    key={valueDatum.id}
                    style={{
                      display: "flex",
                      padding: "0 16px",
                      columnGap: 16,
                      cursor: "pointer",
                      alignItems: "center",
                      height: 48,
                      borderBottom: `1px solid ${Colors.OFF_WHITE}`,
                    }}
                  >
                    <CheckBox
                      style={{ flexShrink: 100 }}
                      color={Colors.BLACK}
                      value={valueDatum.isSelected}
                      onChange={(event) => handleClickFilterValue(valueDatum)} />
                    <p>{valueDatum.title}</p>
                  </div>
                );
              });
          }}
        </Popup>
      )}

      <div className="flex-spacer"></div>

      <div
        style={{
          width: 48,
          height: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
        onClick={() => onChange(null)}
      >
        <Cross length={16} color={Colors.GRAY} />
      </div>
    </div>
  );
}
