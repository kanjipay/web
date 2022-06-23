import { onAuthStateChanged } from "firebase/auth";
import { orderBy, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import LoadingPage from "../../components/LoadingPage";
import Collection from "../../enums/Collection";
import { Colors } from "../../enums/Colors";
import { auth } from "../../utils/FirebaseUtils";
import { useOpenAuthPage } from "../auth/useOpenAuthPage";
import Merchant from "./merchant/Merchant";
import SelectMembershipPage from "./SelectMembershipPage";

export default function TicketChecker() {
  // Should probably just have a navbar with a routes component definining the title deciding the 
  const [user, setUser] = useState(null)
  const [hasLoadedUser, setHasLoadedUser] = useState(false)
  const [authUser, setAuthUser] = useState(null)
  const openAuthPage = useOpenAuthPage()
  const { state } = useLocation()
  const backPath = "/"

  const [memberships, setMemberships] = useState(null)

  useEffect(() => {
    return onAuthStateChanged(auth, newAuthUser => {
      setHasLoadedUser(true)

      if (hasLoadedUser && (
        (!authUser && !newAuthUser) ||
        (authUser && newAuthUser && authUser.uid === newAuthUser.uid)
      )) { return }

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
  
  return memberships ? <div style={{ backgroundColor: Colors.OFF_WHITE_LIGHT }}>
    <Routes>
      <Route path="/" element={<SelectMembershipPage memberships={memberships} />} />
      <Route path="/:merchantId/*" element={<Merchant />} />
    </Routes>
  </div> :
  <LoadingPage />
}