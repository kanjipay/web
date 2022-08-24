import Spinner from "../assets/Spinner"
import Spacer from "../components/Spacer"

export default function LoadingPage({ message, ...props }) {
  return (
    <div className="container" {...props}>
      <div className="centred">
        <Spinner length={64} />
        <Spacer y={2} />
        {message && (
          <div className="header-xs" style={{ textAlign: "center" }}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}
