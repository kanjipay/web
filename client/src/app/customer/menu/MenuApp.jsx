import { Route, Routes } from "react-router-dom";
import { Colors } from "../../../enums/Colors";
import Merchant from "./menu/Merchant";
import Orders from "./order/Order";
import RedirectPageMercado from "./RedirectPageMercado";

export default function MenuApp() {
  return <div style={{ backgroundColor: Colors.OFF_WHITE_LIGHT }}>
    <Routes>
      <Route path="orders/:orderId/*" element={<Orders />} />
      <Route path=":merchantId/*" element={<Merchant />} />
      <Route path="mcp-redirect" element={<RedirectPageMercado />} />
    </Routes>
  </div>
}
