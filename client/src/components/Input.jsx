import { Colors } from "./CircleButton";
import Spacer from "./Spacer";

const textInputStyle = {
  backgroundColor: Colors.OFF_WHITE_LIGHT,
  color: Colors.BLACK,
  boxSizing: "border-box",
  padding: "16px",
  width: "100%",
}

export function InputGroup({ name, label, explanation, Input, value, onChange, ...props }) {
  return <label>
    <span className="header-xs">{label}</span>
    {
      explanation ?
        <div>
          <Spacer y={2} />
          <p className="text-body-faded">{explanation}</p>
          <Spacer y={2} />
        </div> :
        <Spacer y={1} />
    }
    
    <Input name={name} value={value} onChange={onChange} {...props} />
  </label>
}

export function FileUploadGroup({ name, label, onChange, file }) {
  return <label for="file-upload">
    <span className="header-xs">{label}</span>
    <Spacer y={1} />

    <div style={{ display: "flex", alignItems: "center", columnGap: 16 }}>
      <span style={{
        height: 48,
        backgroundColor: Colors.BLACK,
        color: Colors.WHITE,
        alignItems: "center",
        padding: "0 16px",
        boxSizing: "border-box",
        display: "flex",
        cursor: "pointer"
      }}>
        {file ? "Change file" : "Add file"}
      </span>
      {file?.name}
    </div>
    
    <input name={name} id="file-upload" type="file" style={{ display: "none" }} onChange={onChange} />
  </label>
}

export default function TextField({ placeholder, style, ...props }) {
  const inputStyle = {
    height: 48,
    ...textInputStyle,
    ...style,
  };

  return <input placeholder={placeholder} style={inputStyle} {...props} />
}

export function TextArea({ placeholder, style, ...props}) {
  return <textarea placeholder={placeholder} style={{
    ...textInputStyle,
    border: 0,
    height: 100,
    ...style
  }} {...props} />
}
