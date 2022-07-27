import Dropdown from "../../../components/input/Dropdown";
import { IntField } from "../../../components/input/IntField";
import { TimeInterval } from "../../../enums/TimeInterval";

export default function TimeIntervalPicker({ name, value = { amount: 1, interval: TimeInterval.WEEK }, onChange, prefix, suffix }) {
  const pluralisationSuffix = value.amount === 1 ? "" : "s";

  return <div>

    <div
      name={name}
      style={{ display: "flex", columnGap: 16, alignItems: "center" }}
    >
      {prefix}
      <IntField
        value={value.amount}
        maxChars={2}
        onChange={event => {
          const amount = event.target.value;

          let finalAmount;

          try {
            finalAmount = parseInt(amount, 10);
          } catch (err) {
            finalAmount = amount;
          }

          onChange({
            target: {
              name,
              value: { ...value, amount: finalAmount }
            }
          });
        }}
        style={{ width: 44 }} />
      <Dropdown
        value={value.interval}
        onChange={event => onChange({
          target: {
            name,
            value: { ...value, interval: event.target.value }
          }
        })}
        optionList={[
          { label: "Day" + pluralisationSuffix, value: TimeInterval.DAY },
          { label: "Week" + pluralisationSuffix, value: TimeInterval.WEEK },
          { label: "Month" + pluralisationSuffix, value: TimeInterval.MONTH },
        ]}
        style={{ width: 120 }} />
      {suffix}
    </div>
  </div>;
}
