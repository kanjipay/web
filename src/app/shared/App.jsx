import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Home from "../brand/HomePage";
import NotFound from "./NotFoundPage";
import MerchantDashboard from "../merchant/DummyDashboardPage";
import { BrowserRouter } from "react-router-dom";
import Menu from "../checkout/menu/Menu";
import { v4 as uuid } from 'uuid';

export default function App() {
  useEffect(() => {
    const deviceId = localStorage.getItem("deviceId")

    if (!deviceId) {
      localStorage.setItem("deviceId", uuid())
    }
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/menu/:merchantId/*" element={<Menu />} />

        <Route
          path="/merchant/test/dashboard/385as2als921hsa"
          element={<MerchantDashboard />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
