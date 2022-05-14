import { Colors } from "./CircleButton";

export default function Input({ placeholder, style, ...props }) {
  const inputStyle = {
    backgroundColor: Colors.OFF_WHITE_LIGHT,
    height: 48,
    color: Colors.BLACK,
    boxSizing: "border-box",
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
