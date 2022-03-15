export default function Location({ length = 32, color = "black" }) {
  return (
    <svg
      width={length}
      height={length}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M33.7132 56.6667C38.1372 50.0129 49.5999 32.0111 49.5999 24.1153C49.5999 14.3314 41.7201 6.39993 31.9999 6.39993C22.2797 6.39993 14.3999 14.3314 14.3999 24.1153C14.3999 32.0111 25.8626 50.0129 30.2866 56.6667C31.1095 57.9044 32.8903 57.9044 33.7132 56.6667ZM31.9999 32.0001C36.4182 32.0001 39.9999 28.4183 39.9999 24.0001C39.9999 19.5818 36.4182 16.0001 31.9999 16.0001C27.5816 16.0001 23.9999 19.5818 23.9999 24.0001C23.9999 28.4183 27.5816 32.0001 31.9999 32.0001Z"
        fill={color}
      />
    </svg>
  );
}
