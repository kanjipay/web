export default function Analytics({ length = 32, color = "black" }) {
  return (
    <svg width={length} height={length} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 24L15 12L18.5 19L26.5 9" stroke={color} strokeWidth="3.2"/>
    </svg>
  );
}