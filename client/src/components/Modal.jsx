import { Colors } from "../enums/Colors"

export function Modal({ children, style, modalStyle }) {
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        backgroundColor: "#00000088",
        position: "relative",
        ...style
      }}
    >
      <div
        className="centred"
        style={{
          backgroundColor: Colors.WHITE,
          padding: 16,
          width: 320,
          boxSizing: "border-box",
          ...modalStyle,
        }}
      >
        {children}
      </div>
    </div>
  )
}
