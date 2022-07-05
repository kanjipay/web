import { Colors } from "../enums/Colors"
import "./Spinner.css"

export default function Spinner({
  color = Colors.BLACK,
  length = 64,
  ...props
}) {
  return (
    <svg
      className="Spinner"
      width={length}
      height={length}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M96 50C96 59.0979 93.3021 67.9916 88.2476 75.5562C83.1931 83.1209 76.0088 89.0168 67.6034 92.4985C59.198 95.9801 49.949 96.891 41.0258 95.1161C32.1027 93.3412 23.9063 88.9601 17.4731 82.5269C11.0399 76.0937 6.6588 67.8973 4.88388 58.9742C3.10896 50.051 4.01991 40.802 7.50154 32.3966C10.9832 23.9912 16.8791 16.8069 24.4438 11.7524C32.0084 6.69785 40.9021 4 50 4"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="square"
      />
    </svg>
  )
}
