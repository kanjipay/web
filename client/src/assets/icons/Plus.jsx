export default function Plus({ length = 32, color = "black" }) {
  return <svg 
    width={length}
    height={length}
    viewBox="0 0 32 32" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M16 8V16M16 24V16M16 16H6H24" 
      stroke={color}
      stroke-width="4" 
      stroke-linecap="square" 
      stroke-linejoin="mitre"
    />
  </svg>
}
