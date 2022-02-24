import "./App.css";
import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./Home";
import Menu from "./Menu";
import NotFound from "./NotFound";

export default function App() {
  return (
    <Routes>

      <Route path="/" element={<Home />} />
      <Route
        path="/checkout/:merchant_id"
        element={<Menu />}
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}