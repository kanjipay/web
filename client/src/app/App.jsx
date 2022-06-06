import React from "react";
import { Route, Routes } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import MenuApp from "./customer/menu/MenuApp";
import MerchantApp from "./dashboard/menu/MerchantApp";
import { Brand } from "./brand/Brand";
import OneTimeLinkPage from "./shared/OneTimeLinkPage";
import EventsApp from "./customer/events/EventsApp";
import Checkout from "./checkout/Checkout";
import Dashboard from "./dashboard/Dashboard";
import Auth from "./auth/Auth";
import { IntlProvider } from 'react-intl'

export default function App() {
  console.log("language: ", navigator.language)

  return <IntlProvider locale={navigator.language} defaultLocale="en-GB">
    <BrowserRouter>
      <Routes>
        <Route path="/menu/*" element={<MenuApp />} />
        <Route path="/events/*" element={<EventsApp />} />
        <Route path="/checkout/*" element={<Checkout />} />
        <Route path="/link/:linkId" element={<OneTimeLinkPage />} />
        <Route path="/merchant/*" element={<MerchantApp />} />
        <Route path="/auth/*" element={<Auth />} />
        <Route path="/dashboard/*" element={<Dashboard />} />

        {/* Brand pages */}
        <Route path="*" element={<Brand />} />
      </Routes>
    </BrowserRouter>
  </IntlProvider>
}
