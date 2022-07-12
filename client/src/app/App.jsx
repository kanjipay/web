import React, { useEffect } from "react"
import { Route, Routes } from "react-router-dom"
import { BrowserRouter } from "react-router-dom"
import MenuApp from "./customer/menu/MenuApp"
import MerchantApp from "./dashboard/menu/MerchantApp"
import { Brand } from "./brand/Brand"
import OneTimeLinkPage from "./shared/OneTimeLinkPage"
import EventsApp from "./customer/events/EventsApp"
import Checkout from "./checkout/Checkout"
import Dashboard from "./dashboard/Dashboard"
import Auth from "./auth/Auth"
import { IntlProvider } from "react-intl"
import AttributionLinkPage from "./shared/attribution/AttributionLinkPage"
import { AnalyticsManager } from "../utils/AnalyticsManager"
import TicketChecker from "./ticketChecker/TicketChecker"
import { UAParser } from "ua-parser-js"

export default function App() {
  console.log("language: ", navigator.language)

  useEffect(() => {
    const userAgent = UAParser(navigator.userAgent)
    const browser = userAgent.browser.name

    if (["Instagram", "Facebook"].includes(browser)) {
      const url = new URL(window.location.href)
      url.protocol = "googlechrome"

      window.location.href = url.href
    }
  }, [])

  useEffect(() => {
    AnalyticsManager.main.logEvent("InitialiseApp")
  }, [])

  return (
    <IntlProvider locale={navigator.language} defaultLocale="en-GB">
      <BrowserRouter>
        <Routes>
          <Route path="/menu/*" element={<MenuApp />} />
          <Route path="/events/*" element={<EventsApp />} />
          <Route path="/checkout/*" element={<Checkout />} />
          <Route path="/link/:linkId" element={<OneTimeLinkPage />} />
          <Route
            path="/l/:attributionLinkId"
            element={<AttributionLinkPage />}
          />
          <Route path="/merchant/*" element={<MerchantApp />} />
          <Route path="/auth/*" element={<Auth />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="/ticket-checker/*" element={<TicketChecker />} />

          {/* Brand pages */}
          <Route path="*" element={<Brand />} />
        </Routes>
      </BrowserRouter>
    </IntlProvider>
  )
}
