import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Home from "../brand/HomePage";
import NotFound from "./NotFoundPage";
import { BrowserRouter } from "react-router-dom";
import Menu from "../checkout/menu/Menu";
import { AnalyticsManager } from "../../utils/AnalyticsManager";

export default function App() {
  useEffect(() => {
    AnalyticsManager.main.setUserGroup("userType", "customer");
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/menu/:merchantId/*" element={<Menu />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
