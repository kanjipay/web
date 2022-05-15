import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import Carat from "../../assets/icons/Carat"

export default function MerchantDropdown({ memberships }) {
  const { merchantId } = useParams()
  const [membership, setMembership] = useState(null)

  useEffect(() => {
    setMembership(memberships.find(m => m.merchantId === merchantId))
  }, [merchantId, memberships])

  if (membership) {
    return <div style={{ display: "flex", columnGap: 8, alignItems: "center" }}>
      {
        memberships.length > 1 && <Carat length={24} />
      }
      <h4 className="header-xs">{membership.merchantName}</h4>
    </div>
  } else {
    return null
  }
}