

export default function Warning({ length = 32, color = "black" }) {
  return <svg width={length} height={length} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5H20L18 22H14L12 5Z" fill={color} />
    <rect x="14" y="24" width="4" height="4" fill={color} />
  </svg>
}
