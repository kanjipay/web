import Spacer from "../../components/Spacer"
import "./BankTile.css"

export default function BankTile({ name, imageRef, ...props }) {
  return <div {...props} className="BankTile">
    <img alt={name} src={imageRef} style={{ width: 80, height: 80, margin: "auto" }} />
    <Spacer y={2} />
    <h3 className="header-xs">{name}</h3>
  </div>
}