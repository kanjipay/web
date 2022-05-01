import Spacer from "../../components/Spacer"
import "./BankTile.css"

export default function CrezcoBankTile({ bankDatum, ...props }) {
  const name = bankDatum.bankName

  return <div className="BankTile" {...props}>
    <img alt={name} src={bankDatum.logoUrl} style={{ width: 80, height: 80, margin: "auto" }} />
    <Spacer y={1} />
    <h3 className="header-xs">{name}</h3>
  </div>
}