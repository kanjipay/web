import { useEffect } from "react";

export default function NotFound() {
  useEffect(() => {
    document.title = "Page not found";
  }, []);

  return <h1>Not found</h1>;
}
