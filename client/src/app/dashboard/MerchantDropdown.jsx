import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import Carat from "../../assets/icons/Carat"
import { Colors } from "../../components/CircleButton"

export default function MerchantDropdown({ memberships }) {
  const { merchantId } = useParams()
  const [membership, setMembership] = useState(null)

  useEffect(() => {
    setMembership(memberships.find(m => m.merchantId === merchantId))
  }, [merchantId, memberships])

  if (membership) {
    return <div style={{ display: "flex", columnGap: 8, alignItems: "center" }}>
      {
        <Carat length={20} color={Colors.WHITE} />
      }
      <h4 className="header-xs" style={{ color: Colors.WHITE }}>{membership.merchantName}</h4>
    </div>
  } else {
    return null
  }
}