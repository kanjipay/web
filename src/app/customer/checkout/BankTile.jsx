import "./BankTile.css"

export default function BankTile({ bankDatum, ...props }) {
  const name = bankDatum.name.replace(' Open Banking', '')

  return <div className="BankTile" {...props}>
    <img alt={name} src={bankDatum.iconUrl} style={{ width: 80, height: 80, margin: "auto" }} />
    <h3 className="header-xs">{name}</h3>
  </div>
}