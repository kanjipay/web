export default function Details({ length = 32, color = "black" }) {
  return (
    <svg
      width={length}
      height={length}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="17"
        y="11"
        width="30"
        height="42"
        rx="7.8"
        stroke={color}
        strokeWidth="6"
      />
      <path
        d="M33 21L39 21"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="25" cy="21" r="3" fill={color} />
      <path
        d="M33 29H39"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="25" cy="29" r="3" fill={color} />
      <path
        d="M33 37H39"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="25" cy="37" r="3" fill={color} />
    </svg>
  );
}
