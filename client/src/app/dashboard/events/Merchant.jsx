import { useEffect, useState } from "react";
import { NavLink, Route, Routes, useNavigate, useParams } from "react-router-dom";
import Analytics from "../../../assets/icons/Analytics";
import Clock from "../../../assets/icons/Clock";
import Settings from "../../../assets/icons/Settings";
import Tick from "../../../assets/icons/Tick";
import Spinner from "../../../assets/Spinner";
import { Colors } from "../../../enums/Colors";
import IconActionPage from "../../../components/IconActionPage";
import Collection from "../../../enums/Collection";
import AnalyticsPage from "./analytics/AnalyticsPage";
import CrezcoConnectRedirectPage from "./CrezcoConnectRedirectPage";
import Events from "./Events";
import SettingsPage from "./SettingsPage";
import ConnectCrezcoPage from "./ConnectCrezcoPage";
import ConnectStripePage from "./ConnectStripePage";
import StripeConnectRedirectPage from "./StripeConnectRedirectPage";
import Discover from "../../../assets/icons/Discover";
import UsersPage from "./UsersPage";
import StripeStatus from "../../../enums/StripeStatus";

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
    let routes = []

    if (merchant.crezco) {
      routes.push(
        <Route path="crezco-connected" element={
          <IconActionPage
            Icon={Tick}
            iconBackgroundColor={Colors.OFF_WHITE_LIGHT}
            iconForegroundColor={Colors.BLACK}
            title="Bank details added"
            name="crezco-connected"
            body="You're now all set up to receive payments by bank transfer!"
            primaryAction={() => navigate(`/dashboard/o/${merchantId}/events`)}
            primaryActionTitle="Continue"
          />
        } />
      )

      let stripeRedirectPage

      switch (merchant.stripe?.status) {
        case StripeStatus.CHARGES_ENABLED:
          stripeRedirectPage = <IconActionPage
            Icon={Tick}
            iconBackgroundColor={Colors.OFF_WHITE_LIGHT}
            iconForegroundColor={Colors.BLACK}
            title="Card payments enabled"
            name="stripe-connected"
            body="You're now all set up to receive card payments!"
            primaryAction={() => navigate(`/dashboard/o/${merchantId}/events`)}
            primaryActionTitle="Continue"
          />
          break;
        case StripeStatus.DETAILS_SUBMITTED:
          stripeRedirectPage = <IconActionPage
            Icon={Tick}
            iconBackgroundColor={Colors.OFF_WHITE_LIGHT}
            iconForegroundColor={Colors.BLACK}
            title="Details submitted"
            name="stripe-connected"
            body="Stripe needs to verify some of your details before you can receive card payments. This normally only takes a few days, and they'll send you an email once it's done."
            primaryAction={() => navigate(`/dashboard/o/${merchantId}/events`)}
            primaryActionTitle="Continue"
          />
          break;
        case StripeStatus.DETAILS_NOT_SUBMITTED:
          stripeRedirectPage = <IconActionPage
            Icon={Tick}
            iconBackgroundColor={Colors.OFF_WHITE_LIGHT}
            iconForegroundColor={Colors.BLACK}
            title="Stripe onboarding incomplete"
            name="stripe-connected"
            body="You haven't filled in all the details needed for your Stripe onboarding. Any details you have filled in are saved."
            primaryAction={() => navigate(`/dashboard/o/${merchantId}/events`)}
            primaryActionTitle="Continue"
          />
          break;
        default:
          stripeRedirectPage = <StripeConnectRedirectPage />
      }

      routes.push(<Route path="stripe-connected" element={stripeRedirectPage} />)

      if (
        [StripeStatus.CHARGES_ENABLED, StripeStatus.DETAILS_SUBMITTED].includes(merchant.stripe?.status) || 
        merchant.stripe?.wasSkipped
      ) {
        routes.push(
          <Route path="events/*" element={<Events merchant={merchant} />} />,
          <Route path="/" element={<AnalyticsPage merchant={merchant} />} />,
          <Route path="analytics" element={<AnalyticsPage merchant={merchant} />} />,
          <Route path="settings" element={<SettingsPage merchant={merchant} />} />,
          <Route path="users" element={<UsersPage merchant={merchant} />} />,
        )
      } else {
        routes.push(
          <Route path="*" element={<ConnectStripePage />} />
        )
      }
    } else {
      routes.push(
        <Route path="crezco-connected" element={<CrezcoConnectRedirectPage />} />,
        <Route path="*" element={<ConnectCrezcoPage user={user} />} />
      )
    }

    return <div style={{ height: "calc(100vh - 56px)", position: "relative", display: "flex" }}>
      <nav style={{ width: 256, backgroundColor: Colors.OFF_BLACK, position: "fixed", height: "100vh" }}>
        <SidebarHeader title="Manage" />
        <SidebarItem to="events" title="Events" Icon={Clock} />
        <SidebarItem to="analytics" title="Analytics" Icon={Analytics} />
        <SidebarHeader title="Organisation" />
        <SidebarItem to="settings" title="Settings" Icon={Settings} />
        {/* <SidebarItem to="users" title="Users" Icon={User} /> */}
      </nav>
      <div className="flex-spacer" style={{ padding: "0 24px", position: "absolute", left: 256, right: 0 }}>
        <Routes>{routes}</Routes>
      </div>
    </div>
  } else {
    const handleGoBack = () => {
      navigate("/dashboard")
    }

    return <IconActionPage
      Icon={Discover}
      title="Organisation not found"
      body="We couldn't find the organisation you specified"
      primaryActionTitle="Go back"
      primaryAction={handleGoBack}
    />
  }
}