export default function Minus({ length = 32, color = "black" }) {
  return (
    <svg width={length} height={length} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 32H48" stroke={color} stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  )
}
