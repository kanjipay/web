import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./app/brand/HomePage";
import NotFound from "./app/shared/NotFoundPage";
import { BrowserRouter } from "react-router-dom";
import Menu from "./app/customer/menu/Menu";
import MerchantApp from "./app/merchant/MerchantApp";
import RedirectPageTruelayer from "./app/customer/checkout/RedirectPageTruelayer";
import Checkout from "./app/customer/checkout/Checkout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/menu/:merchantId/*" element={<Menu />} />
        <Route path="/checkout/*" element={<Checkout />} />

        <Route path="/tl-redirect" element={<RedirectPageTruelayer />} />

        <Route path="/merchant/*" element={<MerchantApp />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};
