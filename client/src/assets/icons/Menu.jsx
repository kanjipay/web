export default function Menu({ length = 32, color = "black" }) {
  return (
    <svg
      width={length}
      height={length}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="7" y="21" width="18" height="4" fill={color} />
      <rect x="7" y="14" width="18" height="4" fill={color} />
      <rect x="7" y="7" width="18" height="4" fill={color} />
    </svg>
  )
}
