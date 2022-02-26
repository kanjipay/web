import "./App.css";
import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./Home";
import Menu from "./Menu";
import NotFound from "./NotFound";
import MerchantDashboard from "./Dashboard";
import CustomerForm from "./CustomerForm";
import DummyOrderPage from "./DummyOrderPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/checkout/:merchant_id" element={<Menu />} />
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
  );
}
