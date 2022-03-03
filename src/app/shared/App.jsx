import "./App.css";
import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "../brand/HomePage";
import MenuPage from "../checkout/menu/MenuPage";
import NotFound from "./NotFoundPage";
import MenuItemPage from "../checkout/menu/MenuItemPage";
import MerchantDashboard from "../merchant/DummyDashboardPage";
import CustomerForm from "../checkout/order/CustomerForm";
import MerchantAboutPage from "../checkout/menu/MerchantAboutPage";
import DummyOrderPage from "../merchant/DummyOrderPage";
import { BrowserRouter } from "react-router-dom";
import BasketPage from "../checkout/basket/BasketPage";
import Menu from "../checkout/menu/Menu";

export default function App() {
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
