import "./App.css";
import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./Home";
import Menu from "./Menu";
import NotFound from "./NotFound";
import MenuItemPage from "./MenuItemPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/checkout/:merchantId" element={<Menu />} />
      <Route path="/checkout/:merchantId/items/:itemId" element={<MenuItemPage />}/>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}