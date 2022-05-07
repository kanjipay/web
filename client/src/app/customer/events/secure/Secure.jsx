import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import LoadingPage from "../../../../components/LoadingPage";
import { auth } from "../../../../utils/FirebaseUtils";
import { useOpenAuthPage } from "../auth/useOpenAuthPage";
import CustomerTickets from "./customerTickets/CustomerTickets";
import Orders from "./orders/Orders";

export default function Secure() {
  const openAuthPage = useOpenAuthPage()
  const location = useLocation()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      setUser(user)

      console.log("successPath", location.pathname)

      if (!user) {
        const backPath = location.state?.backPath ?? "/"

        console.log("backpath", backPath)
        openAuthPage(window.location.pathname, location.state ?? {}, true, backPath)
      }
    })

    return unsub
  })

  if (user) {
    return <Routes>
      <Route path="tickets/*" element={<CustomerTickets user={user} />} />
      <Route path="orders/*" element={<Orders />} />
    </Routes>
  } else {
    return <LoadingPage />
  }
}