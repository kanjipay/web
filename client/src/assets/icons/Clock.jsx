export default function Clock({ length = 32, color = "black" }) {
  return (
    <svg
      width={length}
      height={length}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="32" cy="32" r="21" stroke={color} strokeWidth="6" />
      <path
        d="M32 22V33L39 40"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
