import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDocs, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Link, Route, Routes, useLocation, useParams } from "react-router-dom";
import Carat from "../../assets/icons/Carat";
import User from "../../assets/icons/User";
import { Colors } from "../../components/CircleButton";
import LoadingPage from "../../components/LoadingPage";
import Spacer from "../../components/Spacer";
import Collection from "../../enums/Collection";
import { auth } from "../../utils/FirebaseUtils";
import { useOpenAuthPage } from "../auth/useOpenAuthPage";
import CreateOrganisationPage from "./CreateOrganisationPage";
import Merchant from "./events/Merchant";
import MerchantDropdown from "./MerchantDropdown";
import SelectOrganisationPage from "./SelectOrganisationPage";
import CreateOrganisation from './CreateOrganisation';
import RegisteredConfirm from './RegisteredConfirm';

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const openAuthPage = useOpenAuthPage()
  const { state } = useLocation()
  const backPath = "/"

  const [memberships, setMemberships] = useState(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      setUser(user)

      if (!user || !user.email || !user.emailVerified) {
        
        openAuthPage({
          successPath: window.location.pathname,
          successState: state ?? {},
          backPath,
          requiresPassword: true
        })
      }
    })

    return unsub
  }, [backPath, state, openAuthPage])

  useEffect(() => {
    if (!user || !user.email || !user.emailVerified) { return }

    // Search for available merchants
    const membershipsQuery = query(
      Collection.MEMBERSHIP.ref,
      where("userId", "==", user.uid),
      orderBy("lastUsedAt", "desc")
    )

    onSnapshot(membershipsQuery, snapshot => {
      const memberships = snapshot.docs.map(doc => {
        return { id: doc.id, ...doc.data() }
      })

      setMemberships(memberships)
    })
  }, [user])

  return memberships ?
    <div style={{ position: "relative", minHeight: "100vh", backgroundColor: Colors.WHITE }}>
      <div style={{ 
        position: "fixed",
        display: "flex",
        height: 72, 
        width: "100%",
        zIndex: 100
      }}>
        <div style={{ 
          height: "100%", 
          width: 256,
          boxSizing: "border-box",
          display: "flex", 
          alignItems: "center", 
          padding: "0 24px"
        }}>
          <Link to="/dashboard" className="header-l">
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
              <p>{user.displayName}</p>
              <User />
            </div>
          }
        </div>
      </div>

      <Routes>
        <Route path="/" element={<SelectOrganisationPage memberships={memberships} />} />
        <Route path="/organisation/create" element={<CreateOrganisation />} />
        <Route path="/organisation/confirm" element={<RegisteredConfirm />} />
        <Route path="o/:merchantId/*" element={<Merchant />} />
      </Routes>
    </div> :
    <LoadingPage />
}