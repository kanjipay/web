import { onAuthStateChanged, signOut } from "firebase/auth"
import { orderBy, where } from "firebase/firestore"
import { useEffect, useState } from "react"
import { Link, Route, Routes, useLocation } from "react-router-dom"
import User from "../../assets/icons/User"
import { Colors } from "../../enums/Colors"
import LoadingPage from "../../components/LoadingPage"
import Spacer from "../../components/Spacer"
import Collection from "../../enums/Collection"
import { auth } from "../../utils/FirebaseUtils"
import { useOpenAuthPage } from "../auth/useOpenAuthPage"
import Merchant from "./events/merchant/Merchant"
import MerchantDropdown from "./MerchantDropdown"
import SelectOrganisationPage from "./SelectOrganisationPage"
import CreateOrganisationPage from "./CreateOrganisationPage"
import Popup from "reactjs-popup"
import { MenuItem } from "./events/analytics/MenuItem"
import { isMobile } from "react-device-detect"
import MerchantMobileMenu from "./MerchantMobileMenu"

function UserNavBarItem({ user }) {
  const handleSignOut = () => {
    signOut(auth, () => {
      console.log("Signed out")
    })
  }

  const [isHovering, setIsHovering] = useState(false)

  const navbarItem = (
    <div
      style={{
        display: "flex",
        columnGap: 8,
        alignItems: "center",
        padding: "0 16px",
        boxSizing: "border-box",
        cursor: "pointer",
        height: "100%",
        backgroundColor: isHovering ? Colors.OFF_BLACK_LIGHT : Colors.CLEAR,
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <p className="text-body" style={{ color: Colors.WHITE }}>
        {user.firstName + " " + user.lastName}
      </p>
      <User color={Colors.WHITE} />
    </div>
  )
  return (
    <Popup
      trigger={navbarItem}
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
  )
}

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [hasLoadedUser, setHasLoadedUser] = useState(false)
  const [authUser, setAuthUser] = useState(null)
  const openAuthPage = useOpenAuthPage()
  const { state } = useLocation()
  const backPath = "/"

  const [memberships, setMemberships] = useState(null)

  useEffect(() => {
    return onAuthStateChanged(auth, (newAuthUser) => {
      setHasLoadedUser(true)

      if (
        hasLoadedUser &&
        ((!authUser && !newAuthUser) ||
          (authUser && newAuthUser && authUser.uid === newAuthUser.uid))
      ) {
        return
      }

      console.log("onAuthStateChanged")

      setAuthUser(newAuthUser)

      if (!newAuthUser || !newAuthUser.email) {
        openAuthPage({
          successPath: window.location.pathname,
          successState: state ?? {},
          backPath,
        })
      }
    })
  }, [backPath, state, openAuthPage, authUser, hasLoadedUser])

  useEffect(() => {
    if (!authUser || !authUser.email) {
      return
    }

    return Collection.USER.onChange(authUser.uid, setUser)
  }, [authUser])

  useEffect(() => {
    if (!user) {
      return
    }

    return Collection.MEMBERSHIP.queryOnChange(
      setMemberships,
      where("userId", "==", user.id),
      orderBy("lastUsedAt", "desc")
    )
  }, [user])

  return memberships ? (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <div
        style={{
          position: "fixed",
          display: "flex",
          height: 56,
          width: "100%",
          zIndex: 50,
          backgroundColor: Colors.BLACK,
        }}
      >
        <div
          style={{
            height: "100%",
            width: isMobile ? "auto" : 256,
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            padding: isMobile ? "0 16px" : "0 24px",
          }}
        >
          <Link
            to="/dashboard"
            className="header-m"
            style={{ color: Colors.WHITE }}
          >
            Mercado
          </Link>
        </div>
        <div
          style={{
            display: "flex",
            columnGap: isMobile ? 16 : 24,
            paddingRight: isMobile ? 16 : 0,
            alignItems: "center",
            flexGrow: 100,
          }}
        >
          {
            !isMobile && <Routes>
              <Route
                path="o/:merchantId/*"
                element={<MerchantDropdown memberships={memberships} />}
              />
            </Routes>
          }
          
          <div className="flex-spacer" />

          {!isMobile && user && <UserNavBarItem user={user} />}

          {
            isMobile && <Routes>
              <Route path="o/:merchantId/*" element={<MerchantMobileMenu />} />
            </Routes>
          }
        </div>
      </div>

      <div style={{ minHeight: "calc(100vh-56px)" }}>
        <Spacer y={7} />
        <Routes>
          <Route
            path="/"
            element={<SelectOrganisationPage memberships={memberships} />}
          />
          <Route
            path="o/create"
            element={<CreateOrganisationPage authUser={authUser} />}
          />
          <Route path="o/:merchantId/*" element={<Merchant user={user} />} />
        </Routes>
      </div>
    </div>
  ) : (
    <LoadingPage />
  )
}
