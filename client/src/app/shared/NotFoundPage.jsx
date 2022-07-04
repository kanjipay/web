import { Helmet } from "react-helmet-async"
import { Colors } from "../../enums/Colors"

export default function NotFound() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
      }}
    >
      <Helmet>
        <title>Page not found</title>
      </Helmet>
      <h1
        style={{
          fontFamily: "Rubik, Roboto, sans-serif",
          fontWeight: 600,
          color: Colors.BLACK,
          fontSize: "6em",
        }}
      >
        Page not found
      </h1>
    </div>
  )
}
