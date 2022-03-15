import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "../brand/HomePage";
import NotFound from "./NotFoundPage";
import { BrowserRouter } from "react-router-dom";
import Menu from "../checkout/menu/Menu";
import MerchantApp from "../merchant/MerchantApp";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/menu/:merchantId/*" element={<Menu />} />

        <Route path="/merchant/*" element={<MerchantApp />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
