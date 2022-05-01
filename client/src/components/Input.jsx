import { Colors } from "./CircleButton";

export default function Input({ placeholder, style, ...props }) {
  const inputStyle = {
    backgroundColor: Colors.OFF_WHITE,
    border: 0,
    height: 48,
    borderRadius: 16,
    textAlign: "center",
    display: "flex",
    width: "100%",
    ...style,
  };

  return (
    <div className="Input relative">
      <input placeholder={placeholder} style={inputStyle} {...props} />
    </div>
  );
}
