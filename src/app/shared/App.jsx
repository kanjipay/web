import "./App.css";
import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "../brand/Home";
import Menu from "../checkout/menu/MenuPage";
import NotFound from "./NotFoundPage";
import MenuItemPage from "../checkout/menu/MenuItemPage";
import DummyMerchantDashboard from "../merchant/DummyDashboardPage";
import CustomerForm from "../checkout/order/CustomerForm";
import DummyOrderPage from "../merchant/DummyOrderPage";
import MerchantDashboard from "../merchant/MerchantDashboardPage";
import MerchantLogin from "../merchant/authentication/Login";
import PasswordForm from "../../components/common/PasswordForm";
import { getAnalytics, logEvent } from "firebase/analytics";

const analytics = getAnalytics();
logEvent(analytics, "application_started");

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/checkout/:merchantId" element={<Menu />} />
      <Route
        path="/checkout/:merchantId/items/:itemId"
        element={<MenuItemPage />}
      />
      <Route
        path="/merchant/test/dashboard/old"
        element={<DummyMerchantDashboard />}
      />
      <Route
        path="/merchant/test/dashboard/new"
        element={<MerchantDashboard />}
      />
      <Route path="/merchant/test/login" element={<MerchantLogin />} />
      <Route path="/merchant/test/form" element={<PasswordForm />} />
      <Route
        path="/checkout/test/385as2als921hsa"
        element={<DummyOrderPage />}
      />
      <Route path="/checkout/test/109sjkba2al21s" element={<CustomerForm />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
