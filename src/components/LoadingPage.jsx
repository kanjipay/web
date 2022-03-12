import Spinner from "../assets/Spinner"
import Spacer from "../components/Spacer"

export default function LoadingPage({ message }) {
  return <div className="container">
    <div className="centred">
      <Spinner />
      <Spacer y={2} />
      { message && <div className="header-xs" style={{ textAlign: "center" }}>{message}</div> }
    </div>
  </div>
}