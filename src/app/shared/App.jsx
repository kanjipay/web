import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "../brand/HomePage";
import NotFound from "./NotFoundPage";
import { BrowserRouter } from "react-router-dom";
import Menu from "../customer/menu/Menu";
import MerchantApp from "../merchant/MerchantApp";
import RedirectPageTruelayer from "../customer/checkout/RedirectPageTruelayer";
import Checkout from "../customer/checkout/Checkout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/menu/:merchantId/*" element={<Menu />} />
        <Route path="/checkout/:orderId/*" element={<Checkout />} />

        <Route path="/tl-redirect" element={ <RedirectPageTruelayer />} />

        <Route path="/merchant/*" element={<MerchantApp />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
