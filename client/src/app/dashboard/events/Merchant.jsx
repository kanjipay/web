import { useEffect, useState } from "react"
import {
  NavLink,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom"
import Analytics from "../../../assets/icons/Analytics"
import Clock from "../../../assets/icons/Clock"
import Settings from "../../../assets/icons/Settings"
import Tick from "../../../assets/icons/Tick"
import Spinner from "../../../assets/Spinner"
import { Colors } from "../../../enums/Colors"
import IconActionPage from "../../../components/IconActionPage"
import Collection from "../../../enums/Collection"
import AnalyticsPage from "./analytics/AnalyticsPage"
import CrezcoConnectRedirectPage from "./CrezcoConnectRedirectPage"
import Events from "./Events"
import SettingsPage from "./SettingsPage"
import ConnectCrezcoPage from "./ConnectCrezcoPage"
import ConnectStripePage from "./ConnectStripePage"
import StripeConnectRedirectPage from "./StripeConnectRedirectPage"
import Discover from "../../../assets/icons/Discover"
import UsersPage from "./UsersPage"

function SidebarItem({ title, Icon, ...props }) {
  const [isHovering, setIsHovering] = useState(false)

  return (
    <NavLink
      {...props}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={({ isActive }) => ({
        height: 40,
        fontWeight: 400,
        color: Colors.WHITE,
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        columnGap: 8,
        backgroundColor:
          isHovering || isActive ? Colors.OFF_BLACK_LIGHT : Colors.CLEAR,
      })}
    >
      <Icon color={Colors.WHITE} length={20} />
      {title}
    </NavLink>
  )
}

function SidebarHeader({ title }) {
  return (
    <h4
      className="header-xs"
      style={{ color: Colors.WHITE, padding: "24px 16px 8px 16px" }}
    >
      {title}
    </h4>
  )
}

export default function Merchant({ user }) {
  const { merchantId } = useParams()
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState(true)
  const [merchant, setMerchant] = useState(null)

  useEffect(() => {
    return Collection.MERCHANT.onChange(merchantId, (merchant) => {
      setMerchant(merchant)
      setIsLoading(false)
    })
  }, [merchantId])

  if (isLoading) {
    return (
      <div style={{ height: "calc(100vh - 56px)", position: "relative" }}>
        <div className="centred">
          <Spinner />
        </div>
      </div>
    )
  } else if (merchant) {

    return (
      <div
        style={{
          height: "calc(100vh - 56px)",
          position: "relative",
          display: "flex",
        }}
      >
        <nav
          style={{
            width: 256,
            backgroundColor: Colors.OFF_BLACK,
            position: "fixed",
            height: "100vh",
          }}
        >
          <SidebarHeader title="Manage" />
          <SidebarItem to="events" title="Events" Icon={Clock} test-id="nav-link-events" />
          <SidebarItem to="analytics" title="Analytics" Icon={Analytics} test-id="nav-link-analytics" />
          <SidebarHeader title="Organisation" />
          <SidebarItem to="settings" title="Settings" Icon={Settings} test-id="nav-link-settings" />
          {/* <SidebarItem to="users" title="Users" Icon={User} /> */}
        </nav>
        <div
          className="flex-spacer"
          style={{
            padding: "0 24px",
            position: "absolute",
            left: 256,
            right: 0,
          }}
        >
          <Routes>
            <Route path="events/*" element={<Events merchant={merchant} />} />
            <Route path="/" element={<AnalyticsPage merchant={merchant} />} />
            <Route
              path="analytics"
              element={<AnalyticsPage merchant={merchant} />}
            />
            <Route
              path="settings"
              element={<SettingsPage merchant={merchant} />}
            />
            <Route path="users" element={<UsersPage merchant={merchant} />} />
            <Route path="stripe-connected" element={<StripeConnectRedirectPage />} />
            <Route path="crezco-connected" element={<CrezcoConnectRedirectPage />} />
            <Route path="connect-stripe" element={<ConnectStripePage />} />
            <Route path="connect-crezco" element={<ConnectCrezcoPage user={user} />} />
          </Routes>
        </div>
      </div>
    )
  } else {
    const handleGoBack = () => {
      navigate("/dashboard")
    }

    return (
      <IconActionPage
        Icon={Discover}
        title="Organisation not found"
        body="We couldn't find the organisation you specified"
        primaryActionTitle="Go back"
        primaryAction={handleGoBack}
      />
    )
  }
}
