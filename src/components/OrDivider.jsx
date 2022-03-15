import { Colors } from "./CircleButton";

export default function OrDivider() {
  return (
    <div className="flex-container" style={{ columnGap: 8 }}>
      <div
        className="flex-spacer"
        style={{ height: 1, backgroundColor: Colors.OFF_WHITE }}
      />
      <div className="text-caption">or</div>
      <div
        className="flex-spacer"
        style={{ height: 1, backgroundColor: Colors.OFF_WHITE }}
      />
    </div>
  );
}
