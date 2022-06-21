import { Route, Routes } from "react-router-dom";
import Order from "./Order";
import RedirectPageCrezco from "./RedirectPageCrezco";
import { Colors } from "../../enums/Colors";
import RedirectPageStripe from "./RedirectPageStripe";

export default function Checkout() {
  return <div style={{ backgroundColor: Colors.OFF_WHITE_LIGHT }}>
    <Routes>
      <Route path="o/:orderId/*" element={<Order />} />
      <Route path="cr-redirect" element={<RedirectPageCrezco />} />
      <Route path="stripe-redirect" element={<RedirectPageStripe />} />
    </Routes>
  </div>
}