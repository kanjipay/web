import { useEffect, useState } from "react";

export default function useWindowSize() {
  const isServerSideRendered = typeof window === "undefined";

  const [windowSize, setWindowSize] = useState({
    width: isServerSideRendered ? 1200 : window.innerWidth,
    height: isServerSideRendered ? 800 : window.innerHeight,
  });

  function changeWindowSize() {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  }

  useEffect(() => {
    window.addEventListener("resize", changeWindowSize);

    return () => {
      window.removeEventListener("resize", changeWindowSize);
    };
  }, []);

  return windowSize;
}
