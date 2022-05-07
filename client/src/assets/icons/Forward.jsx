export default function Forward({ length = 32, color = "black" }) {
  return <svg width={length} height={length} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 24L21 16L13 8" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
}