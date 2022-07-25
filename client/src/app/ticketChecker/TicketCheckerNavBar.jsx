import { signOut } from "firebase/auth"
import { useNavigate } from "react-router-dom"
import Popup from "reactjs-popup"
import Back from "../../assets/icons/Back"
import User from "../../assets/icons/User"
import { ButtonTheme } from "../../components/ButtonTheme"
import IconButton from "../../components/IconButton"
import { Colors } from "../../enums/Colors"
import { auth } from "../../utils/FirebaseUtils"
import { MenuItem } from "../dashboard/events/analytics/AnalyticsPage"

export default function TicketCheckerNavBar({ title, back }) {
  const navigate = useNavigate()
  const handleBackClick = () => navigate(back)
  const handleSignOut = () => signOut(auth)

  return (
    <div
      style={{
        position: "fixed",
        width: "100%",
        height: 48,
        zIndex: 100,
        maxWidth: 600,
        display: "relative",
      }}
    >
      <div
        style={{
          backgroundColor: Colors.WHITE,
          width: "100%",
          height: "100%",
          position: "absolute",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: `1px solid ${Colors.OFF_WHITE}`,
        }}
      >
        <h1 className="header-xs">{title}</h1>
      </div>

      <div
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          padding: "0 8px",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
        }}
      >
        {back && (
          <IconButton
            Icon={Back}
            buttonTheme={ButtonTheme.NAVBAR}
            onClick={handleBackClick}
          />
        )}

        <div style={{ flexGrow: 100 }}></div>

        <Popup
          trigger={<IconButton Icon={User} buttonTheme={ButtonTheme.NAVBAR} />}
          closeOnDocumentClick
          arrow={false}
          contentStyle={{
            backgroundColor: Colors.WHITE,
            border: `1px solid ${Colors.OFF_WHITE}`,
            borderBottom: 0,
            width: 160,
          }}
        >
          <MenuItem title="Sign out" onClick={handleSignOut} />
        </Popup>
      </div>
    </div>
  )
}
