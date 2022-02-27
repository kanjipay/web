import "./App.css";
import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "../brand/HomePage";
import Menu from "../checkout/menu/MenuPage";
import NotFound from "./NotFoundPage";
import MenuItemPage from "../checkout/menu/MenuItemPage";
import MerchantDashboard from "../checkout/order/Dashboard";
import CustomerForm from "../checkout/order/CustomerForm";
import DummyOrderPage from "../checkout/order/DummyOrderPage";
import MerchantAboutPage from "../checkout/menu/MerchantAboutPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/checkout/:merchantId" element={<Menu />} />
      <Route path="/checkout/:merchantId/items/:itemId" element={<MenuItemPage />}/>
      <Route path="/checkout/:merchantId/about" element={<MerchantAboutPage />}/>

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
