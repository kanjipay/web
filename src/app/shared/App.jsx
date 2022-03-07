import "./App.css";
import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "../brand/HomePage";
import NotFound from "./NotFoundPage";
import  MerchantApp from "../merchant/MerchantApp";
import CustomerForm from "../checkout/order/CustomerForm";
import { BrowserRouter } from "react-router-dom";
import Menu from "../checkout/menu/Menu";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/menu/:merchantId/*" element={<Menu />} />

        <Route
          path="/merchant/*"
          element={<MerchantApp />}
        />
        <Route path="/checkout/test/109sjkba2al21s" element={<CustomerForm />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
