import React from "react";
import { Route, Routes } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import Menu from "./app/customer/menu/Menu";
import MerchantApp from "./app/merchant/MerchantApp";
import RedirectPageTruelayer from "./app/customer/checkout/RedirectPageTruelayer";
import Checkout from "./app/customer/checkout/Checkout";
import { Brand } from "./app/brand/Brand";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/menu/:merchantId/*" element={<Menu />} />
        <Route path="/checkout/*" element={<Checkout />} />

        <Route path="/tl-redirect" element={<RedirectPageTruelayer />} />

        <Route path="/merchant/*" element={<MerchantApp />} />
        <Route path="*" element={<Brand />} />
      </Routes>
    </BrowserRouter>
  );
}
