

export default function Carat({ length = 32, color = "black" }) {
  return <svg width={length} height={length} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 14L16 22L24 14" stroke={color} strokeWidth="4" strokeLinecap="square" />
  </svg>
}
