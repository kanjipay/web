import React, { useEffect } from "react"
import { Route, Routes, useLocation } from "react-router-dom"
import { Brand } from "./brand/Brand"
import OneTimeLinkPage from "./shared/OneTimeLinkPage"
import EventsApp from "./customer/events/EventsApp"
import Checkout from "./checkout/Checkout"
import Dashboard from "./dashboard/Dashboard"
import Auth from "./auth/Auth"
import AttributionLinkPage from "./shared/attribution/AttributionLinkPage"
import { AnalyticsEvent, AnalyticsManager } from "../utils/AnalyticsManager"
import TicketChecker from "./ticketChecker/TicketChecker"
import { UAParser } from "ua-parser-js"
import Legal from "./legal/Legal"
import EventShortLinks from "./customer/events/EventShortLinks"
import SalesSender from "./SalesSender"
import smoothscroll from 'smoothscroll-polyfill';
import ErrorPage from "./shared/ErrorPage"

smoothscroll.polyfill();

export default function App() {
  const location = useLocation()

  useEffect(() => {
    const userAgent = UAParser(navigator.userAgent)
    const browser = userAgent.browser.name

    if (["Instagram", "Facebook"].includes(browser)) {
      const isAppleOS = ["iOS", "Mac OS"].includes(userAgent.os.name)

      if (isAppleOS) {
        const url = new URL(window.location.href)
        url.protocol = "googlechrome"

        window.location.href = url.href
      } else {
        const url = new URL(window.location.href)
        url.protocol = "googlechromes"

        window.location.href = url.href
      }
    }
  }, [location])

  useEffect(() => {
    AnalyticsManager.main.logEvent(AnalyticsEvent.INITIALISE_APP)
  }, [])

  return (
    <Routes>
      <Route path="/xlx-v" element={<SalesSender />} />
      <Route path="/events/*" element={<EventsApp />} />
      <Route path="/e/:merchantLinkName" element={<EventShortLinks />} />
      <Route path="/e/:merchantLinkName/:eventLinkName" element={<EventShortLinks />} />
      <Route path="/checkout/*" element={<Checkout />} />
      <Route path="/link/:linkId" element={<OneTimeLinkPage />} />
      <Route
        path="/l/:attributionLinkId"
        element={<AttributionLinkPage />}
      />
      <Route path="/auth/*" element={<Auth />} />
      <Route path="/error" element={<ErrorPage />} />
      <Route path="/dashboard/*" element={<Dashboard />} />
      <Route path="/ticket-checker/*" element={<TicketChecker />} />
      <Route path="/legal/*" element={<Legal />} />

      {/* Brand pages */}
      <Route path="*" element={<Brand />} />
    </Routes>
  )
}
