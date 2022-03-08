export default function Plus({ length = 32, color = "black" }) {
  return (
    <svg width={length} height={length} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 16V32M32 48V32M32 32H16H48" stroke={color} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
