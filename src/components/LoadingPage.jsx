import Spinner from "../assets/Spinner"
import Spacer from "../components/Spacer"
import './LoadingPage.css'

export default function LoadingPage({ message }) {
  return <div className="LoadingPage">
    <div className="centred">
      <Spinner className="LoadingPage__spinner" />
      <Spacer y={2} />
      { message && <div className="header-xs" style={{ textAlign: "center" }}>{message}</div> }
    </div>
  </div>
}