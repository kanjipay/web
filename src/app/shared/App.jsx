import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Home from "../brand/HomePage";
import NotFound from "./NotFoundPage";
import MerchantDashboard from "../merchant/DummyDashboardPage";
import CustomerForm from "../checkout/order/CustomerForm";
import DummyOrderPage from "../merchant/DummyOrderPage";
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
        <Route
          path="/checkout/test/385as2als921hsa"
          element={<DummyOrderPage />}
        />
        <Route path="/checkout/test/109sjkba2al21s" element={<CustomerForm />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
