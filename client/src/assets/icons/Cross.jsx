export default function Cross({ length = 32, color = "black" }) {
  return (
    <svg
      width={length}
      height={length}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M8 23.5563L23.5563 7.99999" stroke={color} stroke-width="4" />
      <path
        d="M23.5564 23.5563L8.00005 7.99999"
        stroke={color}
        stroke-width="4"
      />
    </svg>
  )
}
