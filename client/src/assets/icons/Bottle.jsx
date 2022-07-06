export default function Bottle({ length = 32, color = "black" }) {
  return (
    <svg
      width={length}
      height={length}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M62 79.25V78.5H62.0105C62.1829 72.3516 64.4672 66.8506 68.0145 63.0225C68.1799 47.6433 69.7361 33.932 72.1213 24.4518C71.4762 24.284 71 23.6976 71 23V12.5C71 11.6716 71.6716 11 72.5 11H79.9999H87.5C88.3284 11 89 11.6716 89 12.5V23C89 23.6977 88.5237 24.2841 87.8785 24.4518C90.2637 33.932 91.8199 47.6432 91.9853 63.0223C95.5327 66.8504 97.8171 72.3515 97.9895 78.5H98V79.25V141.5C98 145.642 89.9411 149 80 149C70.0589 149 62 145.642 62 141.5V79.25Z"
        fill={color}
      />
    </svg>
  )
}
