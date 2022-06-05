export default function Cocktail({ length = 32, color = "black" }) {
  return (
    <svg
      width={length}
      height={length}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M46 34H114C115.648 34 116.589 35.8815 115.6 37.2L81.6 82.5333C80.8 83.6 79.2 83.6 78.4 82.5333L44.4 37.2C43.4111 35.8815 44.3519 34 46 34Z"
        stroke={color}
        strokeWidth="4"
      />
      <path
        d="M50.0002 48.0001H110L80.0002 88.0001L50.0002 48.0001Z"
        fill={color}
      />
      <rect x="74.0005" y="80.0001" width="12" height="40" fill={color} />
      <ellipse cx="79.9993" cy="122" rx="26" ry="6" fill={color} />
    </svg>
  );
}
