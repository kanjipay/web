import { Route, Routes } from "react-router-dom";
import PaymentIntent from "./PaymentIntent";
import RedirectPageCrezco from "./RedirectPageCrezco";
import RedirectPageMoneyhub from "./RedirectPageMoneyhub";

export default function Checkout() {
  return <Routes>
    <Route path="pi/:paymentIntentId/*" element={<PaymentIntent />} />
    <Route path="mh-redirect" element={<RedirectPageMoneyhub />} />
    <Route path="cr-redirect" element={<RedirectPageCrezco />} />
  </Routes>
}