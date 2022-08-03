import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Carat from "../../assets/icons/Carat"
import { Colors } from "../../enums/Colors"
import Popup from "reactjs-popup"
import { MenuItem } from "./events/analytics/MenuItem"

export default function MerchantDropdown({ memberships }) {
  const { merchantId } = useParams()
  const navigate = useNavigate()
  const [membership, setMembership] = useState(null)

  useEffect(() => {
    setMembership(memberships.find((m) => m.merchantId === merchantId))
  }, [merchantId, memberships])

  const [isHovering, setIsHovering] = useState(false)

  const handleSwitchMerchant = (merchantId, close) => {
    if (merchantId !== membership.merchantId) {
      navigate(`/dashboard/o/${merchantId}`)
    }

    close()
  }

  if (membership) {
    const dropdown = (
      <div
        style={{
          display: "flex",
          columnGap: 8,
          padding: "0 16px",
          boxSizing: "border-box",
          width: 320,
          height: "100%",
          alignItems: "center",
          backgroundColor: isHovering ? Colors.OFF_BLACK_LIGHT : Colors.CLEAR,
          cursor: "pointer",
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {<Carat length={20} color={Colors.WHITE} />}
        <h4
          className="header-xs"
          style={{
            color: Colors.WHITE,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {membership.merchantName}
        </h4>
      </div>
    )
    return (
      <Popup
        trigger={dropdown}
        closeOnDocumentClick
        contentStyle={{
          border: `1px solid ${Colors.OFF_WHITE}`,
          // borderBottom: 0,
          width: 320,
          backgroundColor: Colors.WHITE,
        }}
        arrow={false}
      >
        {(close) => (
          <div>
            <MenuItem
              showsSeparator={false}
              title="All organisations"
              onClick={() => navigate("/dashboard")}
            />
            <MenuItem
              title="Create an organisation"
              onClick={() => navigate("/dashboard/o/create")}
            />
            <h4 className="text-body-faded" style={{ padding: 16 }}>
              Your organisations
            </h4>
            {memberships.map((m) => {
              return (
                <MenuItem
                  showsSeparator={false}
                  key={m.id}
                  title={m.merchantName}
                  isSelected={membership.id === m.id}
                  onClick={() => handleSwitchMerchant(m.merchantId, close)}
                />
              )
            })}
          </div>
        )}
      </Popup>
    )
  } else {
    return null
  }
}
