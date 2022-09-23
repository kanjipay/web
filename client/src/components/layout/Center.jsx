export default function Center({ children, style }) {
  return <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", ...style }}>
    {children}
  </div>
}