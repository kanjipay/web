import React from "react";
import { Route, Routes } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import Menu from "../customer/menu/Menu";
import MerchantApp from "../merchant/MerchantApp";
import RedirectPageTruelayer from "../customer/checkout/RedirectPageTruelayer";
import Checkout from "../customer/checkout/Checkout";
import { Brand } from "../brand/Brand";

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
};
