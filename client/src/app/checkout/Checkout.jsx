import { Route, Routes } from "react-router-dom";
import PaymentIntent from "./PaymentIntent";
import RedirectPageCrezco from "./RedirectPageCrezco";
import RedirectPageMoneyhub from "./RedirectPageMoneyhub";
import { Colors } from "../../components/CircleButton";

export default function Checkout() {
  return <div style={{ backgroundColor: Colors.OFF_WHITE_LIGHT }}>
    <Routes>
      <Route path="pi/:paymentIntentId/*" element={<PaymentIntent />} />
      <Route path="mh-redirect" element={<RedirectPageMoneyhub />} />
      <Route path="cr-redirect" element={<RedirectPageCrezco />} />
    </Routes>
  </div>
}