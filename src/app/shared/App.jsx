import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Home from "../brand/HomePage";
import NotFound from "./NotFoundPage";
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

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
