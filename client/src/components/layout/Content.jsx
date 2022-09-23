export default function Content({ children, paddingTop = 72, paddingBottom = 100 }) {
  return <div style={{ padding: `${paddingTop}px 16px ${paddingBottom}px 16px` }}>
    {children}
  </div>
}