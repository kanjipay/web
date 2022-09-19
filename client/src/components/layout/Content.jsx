export default function Content({ children, paddingTop = 72 }) {
  return <div style={{ padding: `${paddingTop}px 16px 100px 16px` }}>
    {children}
  </div>
}