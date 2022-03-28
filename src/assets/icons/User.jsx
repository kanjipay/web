export default function User({ length = 32, color = "black" }) {
  return (
    <svg
      width={length}
      height={length}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17.4247 32C12.2196 32 7.83497 36.3755 9.82689 41.1844V41.1844C11.033 44.0962 12.8008 46.742 15.0294 48.9706C17.258 51.1992 19.9038 52.967 22.8156 54.1731C25.7274 55.3792 28.8483 56 32 56C35.1517 56 38.2726 55.3792 41.1844 54.1731C44.0962 52.967 46.742 51.1992 48.9706 48.9706C51.1992 46.742 52.967 44.0962 54.1731 41.1844V41.1844C56.165 36.3755 51.7804 32 46.5753 32H32L17.4247 32Z"
        fill={color}
      />
      <circle cx="32" cy="18" r="10" fill={color} />
    </svg>
  );
}