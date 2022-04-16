import React from "react";
import { Route, Routes } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import Menu from "./app/menu/menu/Menu";
import MerchantApp from "./app/merchant/MerchantApp";
import Checkout from "./app/checkout/Checkout";
import { Brand } from "./app/brand/Brand";
import OneTimeLinkPage from "./app/shared/OneTimeLinkPage";
import RedirectPageMoneyhub from "./app/checkout/RedirectPageMoneyhub";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/menu/:merchantId/*" element={<Menu />} />
        <Route path="/checkout/:orderId/*" element={<Checkout />} />
        <Route path="/mh-redirect" element={<RedirectPageMoneyhub />} />

        <Route path="/merchant/*" element={<MerchantApp />} />
        <Route path="/link/:linkId" element={<OneTimeLinkPage />} />
        <Route path="*" element={<Brand />} />
      </Routes>
    </BrowserRouter>
  );
}
