import Spinner from "../../assets/Spinner"

export default function LoadingPage() {
  return (
    <div style={{ height: "100%", position: "relative" }}>
      <div className="centred">
        <Spinner />
      </div>
    </div>
  )
}
