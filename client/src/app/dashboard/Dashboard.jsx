import { onAuthStateChanged } from "firebase/auth";
import { orderBy, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import User from "../../assets/icons/User";
import { Colors } from "../../components/CircleButton";
import LoadingPage from "../../components/LoadingPage";
import Spacer from "../../components/Spacer";
import Collection from "../../enums/Collection";
import { auth } from "../../utils/FirebaseUtils";
import { useOpenAuthPage } from "../auth/useOpenAuthPage";
import Merchant from "./events/Merchant";
import MerchantDropdown from "./MerchantDropdown";
import SelectOrganisationPage from "./SelectOrganisationPage";
import CreateOrganisationPage from './CreateOrganisationPage';

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [authUser, setAuthUser] = useState(null)
  const openAuthPage = useOpenAuthPage()
  const { state } = useLocation()
  const backPath = "/"

  const [memberships, setMemberships] = useState(null)
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    return onAuthStateChanged(auth, authUser => {
      setAuthUser(authUser)

      if (!authUser || !authUser.email) {
        openAuthPage({
          successPath: window.location.pathname,
          successState: state ?? {},
          backPath,
          requiresPassword: true
        })
      }
    })
  }, [backPath, state, openAuthPage])

  useEffect(() => {
    if (!authUser || !authUser.email) { return }

    return Collection.USER.onChange(authUser.uid, setUser)
  }, [authUser])

  useEffect(() => {
    if (!user) { return }

    return Collection.MEMBERSHIP.queryOnChange(
      setMemberships,
      where("userId", "==", user.id),
      orderBy("lastUsedAt", "desc")
    )
  }, [user])

  useEffect(() => {
    const handleScroll = () => {
      const opaqueDepth = 0
      const transparentDepth = 20
      const yOffset = window.scrollY;
      const newOpacity = Math.max(
        Math.min(
          (yOffset - transparentDepth) / (opaqueDepth - transparentDepth),
          1
        ),
        0
      );

      setOpacity(newOpacity)
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [])

  return memberships ?
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <div style={{ 
        position: "fixed",
        display: "flex",
        height: 56, 
        width: "100%",
        zIndex: 50,
        backgroundColor: Colors.BLACK
      }}>
        <div style={{ 
          height: "100%", 
          width: 256,
          boxSizing: "border-box",
          display: "flex", 
          alignItems: "center", 
          padding: "0 24px"
        }}>
          <Link to="/dashboard" className="header-m" style={{ color: Colors.WHITE }}>
            Mercado
          </Link>
        </div>
        <div style={{
          display: "flex",
          columnGap: 24,
          alignItems: "center", 
          padding: "0 24px",
          flexGrow: 100,
        }}>
          <Routes>
            <Route path="o/:merchantId/*" element={<MerchantDropdown memberships={memberships} />} />
          </Routes>
          <div className="flex-spacer" />
          {
            user && <div style={{ display: "flex", columnGap: 8, alignItems: "center" }}>
              <p className="text-body" style={{ color: Colors.WHITE }}>{user.firstName + " " + user.lastName}</p>
              <User color={Colors.WHITE} />
            </div>
          }
        </div>
      </div>

      <div style={{ minHeight: "calc(100vh-56px)" }}>
        <Spacer y={7} />
        <Routes>
          <Route path="/" element={<SelectOrganisationPage memberships={memberships} />} />
          <Route path="o/create" element={<CreateOrganisationPage />} />
          <Route path="o/:merchantId/*" element={<Merchant user={user} />} />
        </Routes>
      </div>

      
    </div> :
    <LoadingPage />
}