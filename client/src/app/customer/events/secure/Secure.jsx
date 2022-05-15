import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import LoadingPage from "../../../../components/LoadingPage";
import { useOpenAuthPage } from "../../../auth/useOpenAuthPage";
import CustomerTickets from "./customerTickets/CustomerTickets";
import Orders from "./orders/Orders";

export default function Secure({ user }) {
  const openAuthPage = useOpenAuthPage()
  const location = useLocation()

  useEffect(() => {
    if (!user || !user.email) {
      const backPath = location.state?.backPath ?? "/"

      openAuthPage({
        successPath: window.location.pathname,
        successState: location.state ?? {},
        backPath,
        requiresPassword: false
      })
    }
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