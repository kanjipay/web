export default function Cross({ length = 32, color = "black" }) {
  return (
    <svg width={length} height={length} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.96611 9.96602L16.0001 16M22.0341 22.034L16.0001 16M16.0001 16L9.96611 22.034L22.0341 9.96602" stroke={color} stroke-width="4.26667" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  )
}