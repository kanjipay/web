export default function Cutlery({ length = 32, color = "black" }) {
  return (
    <svg
      width={length}
      height={length}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_156_3037)">
        <path
          d="M41.8575 13.9949C41.9378 12.8709 42.8731 12 44 12V12C45.1269 12 46.0622 12.8709 46.1425 13.9949L48 40H40L41.8575 13.9949Z"
          fill={color}
        />
        <path
          d="M29.8575 13.9949C29.9378 12.8709 30.8731 12 32 12V12C33.1269 12 34.0622 12.8709 34.1425 13.9949L36 40H28L29.8575 13.9949Z"
          fill={color}
        />
        <path
          d="M17.8575 13.9949C17.9378 12.8709 18.8731 12 20 12V12C21.1269 12 22.0622 12.8709 22.1425 13.9949L24 40H16L17.8575 13.9949Z"
          fill={color}
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M26 42C27.1046 42 28 41.1046 28 40C28 40 28 40 28 40L32 40L36 40C36 41.1046 36.8955 41.9999 38 41.9999C39.1046 41.9999 40 41.1046 40 40L48 40C48 43.1826 46.3143 46.2348 43.3138 48.4853C40.3132 50.7357 36.2435 52 32 52C27.7566 52 23.6869 50.7357 20.6863 48.4853C17.6858 46.2348 16 43.1826 16 40L24 40C24 41.1046 24.8955 42 26 42Z"
          fill={color}
        />
        <rect x="28" y="48" width="8" height="16" fill={color} />
      </g>
      <defs>
        <clipPath id="clip0_156_3037">
          <path
            d="M0 32C0 14.3269 14.3269 0 32 0V0C49.6731 0 64 14.3269 64 32V32C64 49.6731 49.6731 64 32 64V64C14.3269 64 0 49.6731 0 32V32Z"
            fill="white"
          />
        </clipPath>
      </defs>
    </svg>
  )
}
