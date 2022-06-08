import { useEffect, useState } from "react";
import { Link, NavLink, Route, Routes, useNavigate, useParams } from "react-router-dom";
import Analytics from "../../../assets/icons/Analytics";
import Clock from "../../../assets/icons/Clock";
import Settings from "../../../assets/icons/Settings";
import Tick from "../../../assets/icons/Tick";
import Spinner from "../../../assets/Spinner";
import { Colors } from "../../../components/CircleButton";
import IconActionPage from "../../../components/IconActionPage";
import Collection from "../../../enums/Collection";
import AnalyticsPage from "./AnalyticsPage";
import BankDetailsVerifiedPage from "./BankDetailsVerifiedPage";
import Events from "./Events";
import SettingsPage from "./SettingsPage";
import VerifyBankDetailsPage from "./VerifyBankDetailsPage";

function SidebarItem({ title, Icon, ...props }) {
  const [isHovering, setIsHovering] = useState(false)

  return <NavLink 
    {...props}
    onMouseEnter={() => setIsHovering(true)}
    onMouseLeave={() => setIsHovering(false)}
    style={({isActive}) => ({
      height: 40,
      fontWeight: 400,
      color: Colors.WHITE,
      display: "flex",
      alignItems: "center",
      padding: "0 16px",
      columnGap: 8,
      backgroundColor: (isHovering || isActive) ? Colors.OFF_BLACK_LIGHT : Colors.CLEAR
    })}
  >
    <Icon color={Colors.WHITE} length={20} />
    {title}
  </NavLink>
}

function SidebarHeader({ title }) {
  return <h4 className="header-xs" style={{ color: Colors.WHITE, padding: "24px 16px 8px 16px" }}>{title}</h4>
}

export default function Merchant({ user }) {
  const { merchantId } = useParams()
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState(true)
  const [merchant, setMerchant] = useState(null)

  useEffect(() => {
    return Collection.MERCHANT.onChange(merchantId, merchant => {
      setMerchant(merchant)
      setIsLoading(false)
    })
  }, [merchantId])

  if (isLoading) {
    return <div style={{ height: "calc(100vh - 56px)", position: "relative" }}>
      <div className="centred">
        <Spinner />
      </div>
    </div>
  } else if (merchant) {
    return <div style={{ height: "calc(100vh - 56px)", position: "relative", display: "flex" }}>
      <nav style={{ width: 256, backgroundColor: Colors.OFF_BLACK, position: "fixed", height: "100vh" }}>
        <SidebarHeader title="Manage" />
        <SidebarItem to="events" title="Events" Icon={Clock} />
        <SidebarItem to="analytics" title="Analytics" Icon={Analytics} />
        <SidebarHeader title="Organisation" />
        <SidebarItem to="settings" title="Settings" Icon={Settings} />
      </nav>
      <div className="flex-spacer" style={{ padding: "0 24px", position: "absolute", left: 256, right: 0 }}>
        {
          merchant.crezco ?
            <Routes>
              
              <Route path="events/*" element={<Events merchant={merchant} />} />
              <Route path="/" element={<AnalyticsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="settings" element={<SettingsPage merchant={merchant} />} />
              <Route path="details-verified" element={
                <IconActionPage
                  Icon={Tick}
                  iconBackgroundColor={Colors.OFF_WHITE_LIGHT}
                  iconForegroundColor={Colors.BLACK}
                  title="Bank details added"
                  body="You're now all set up to receive payments! Now let's go to your events page to create your first event."
                  primaryAction={() => navigate(`/dashboard/o/${merchantId}/events`)}
                  primaryActionTitle="Go to events page"
                />
              } />
            </Routes> :
            <Routes>
              <Route path="details-verified" element={<BankDetailsVerifiedPage />} />
              <Route path="*" element={<VerifyBankDetailsPage user={user} />} />
            </Routes>
            
            
        }
      </div>
    </div>
  } else {
    return <div>That merchant doesn't exist</div>
  }
}