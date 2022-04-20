import React from "react";
import { Route, Routes } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import Menu from "./app/menu/menu/Menu";
import MerchantApp from "./app/merchant/MerchantApp";
import Checkout from "./app/checkout/Checkout";
import { Brand } from "./app/brand/Brand";
import OneTimeLinkPage from "./app/shared/OneTimeLinkPage";
import RedirectPageMoneyhub from "./app/shared/RedirectPageMoneyhub";
import Orders from "./app/menu/orders/Orders";
import RedirectPageMercado from "./app/shared/RedirectPageMercado";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Online menu pages */}
        <Route path="/menu/:merchantId/*" element={<Menu />} />
        <Route path="/orders/:orderId/*" element={<Orders />} />
        <Route path="/mcp-redirect" element={<RedirectPageMercado />} />

        {/* Payment pages */}
        <Route path="/checkout/:paymentIntentId/*" element={<Checkout />} />
        <Route path="/link/:linkId" element={<OneTimeLinkPage />} />
        <Route path="/mh-redirect" element={<RedirectPageMoneyhub />} />
        
        {/* Merchant dashboard pages */}
        <Route path="/merchant/*" element={<MerchantApp />} />
        
        {/* Brand pages */}
        <Route path="*" element={<Brand />} />
      </Routes>
    </BrowserRouter>
  );
}
