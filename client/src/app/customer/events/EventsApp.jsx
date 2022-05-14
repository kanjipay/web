import { Route, Routes } from "react-router-dom";
import Secure from "./secure/Secure";
import Merchant from "./merchant/Merchant";
import Auth from "./auth/Auth";
import RedirectPageMercado from "./RedirectPageMercado";
import { Colors } from "../../../components/CircleButton";

export default function EventsApp() {
  return <div>
    <Routes>
      <Route path="s/*" element={<Secure />} />
      <Route path=":merchantId/*" element={<Merchant />} />
      <Route path="auth/*" element={<Auth />} />
      <Route path="mcp-redirect" element={<RedirectPageMercado />} />
    </Routes>
  </div>
  
}