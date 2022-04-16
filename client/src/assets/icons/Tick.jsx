export default function Tick({ length = 32, color = "black" }) {
  return (
    <svg
      width={length}
      height={length}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16 37.3333L26.6667 48L48 16"
        stroke={color}
        strokeWidth="8.53333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
