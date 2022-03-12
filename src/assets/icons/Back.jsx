export default function Back({ length = 32, color = "black" }) {
  return (
    <svg width={length} height={length} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M38 16L22 32L38 48" stroke={color} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
