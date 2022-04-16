export default function Bowl({ length = 32, color = "black" }) {
  return (
    <svg
      width={length}
      height={length}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M26 79.809C26 94.0801 31.6691 107.767 41.7603 117.858C51.8514 127.949 65.538 133.618 79.809 133.618C94.08 133.618 107.767 127.949 117.858 117.858C127.949 107.767 133.618 94.0801 133.618 79.809L79.809 79.809L26 79.809Z"
        fill={color}
      />
      <rect
        x="126.39"
        y="58.2854"
        width="10.7618"
        height="43.0472"
        rx="5.3809"
        transform="rotate(45 126.39 58.2854)"
        fill={color}
      />
      <rect
        x="113.051"
        y="42.1427"
        width="10.7618"
        height="55.7217"
        rx="5.3809"
        transform="rotate(30 113.051 42.1427)"
        fill={color}
      />
      <ellipse cx="79.809" cy="79.8089" rx="53.809" ry="5.3809" fill={color} />
      <path
        d="M66.3562 63.6663C57.0372 52.9045 75.6765 42.1427 66.3562 31.3809"
        stroke={color}
        stroke-width="5.3809"
        stroke-linecap="round"
      />
      <path
        d="M82.4988 63.6663C73.1798 52.9045 91.8191 42.1427 82.4988 31.3809"
        stroke={color}
        stroke-width="5.3809"
        stroke-linecap="round"
      />
      <path
        d="M50.2134 63.6663C40.8944 52.9045 59.5337 42.1427 50.2134 31.3809"
        stroke={color}
        stroke-width="5.3809"
        stroke-linecap="round"
      />
    </svg>
  );
}
