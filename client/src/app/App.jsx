import React, { useEffect } from "react"
import { Route, Routes } from "react-router-dom"
import { Brand } from "./brand/Brand"
import OneTimeLinkPage from "./shared/OneTimeLinkPage"
import EventsApp from "./customer/events/EventsApp"
import Checkout from "./checkout/Checkout"
import Dashboard from "./dashboard/Dashboard"
import Auth from "./auth/Auth"
import AttributionLinkPage from "./shared/attribution/AttributionLinkPage"
import TicketChecker from "./ticketChecker/TicketChecker"
import { UAParser } from "ua-parser-js"
import EventShortLinks from "./customer/events/EventShortLinks"
import SalesSender from "./SalesSender"
import ErrorPage from "./shared/ErrorPage"
import Tawk from "./shared/Tawk"
import { Flex } from "../components/Listing"
import { Colors } from "../enums/Colors"
import Cross from "../assets/icons/Cross"
import IconButton from "../components/IconButton"
import { useState } from "react"

export default function App() {
  const userAgent = UAParser(navigator.userAgent)
  const browser = userAgent.browser.name
  const isMetaWebview = ["Instagram", "Facebook"].includes(browser)
  const isIos = ["iOS"].includes(userAgent.os.name)
  const [isMetaBannerClosed, setIsMetaBannerClosed] = useState(false)
  const os = userAgent.os.name

  useEffect(() => {
    if (isMetaWebview) {
      switch (os) {
        case "iOS":
          const baseUrl = new URL(window.location.href)
          const baseUrlString = baseUrl.href
          const chromeUrl = baseUrlString.replace("https://", "googlechrome://")
          const firefoxUrl = "firefox://open-url?url=" + baseUrlString.replace("https://", "")
          const braveUrl = "brave://open-url?url=" + baseUrlString.replace("https://", "")
          // const duckDuckGoUrl = baseUrlString.replace("https://", "ddgQuickLink://")
          // const edgeUrl = baseUrlString.replace("https://", "microsoft-edge-https://")

          let i = 0

          for (const url of [chromeUrl, firefoxUrl, braveUrl]) {
            setTimeout(() => {
              window.location.href = url
            }, i * 100)

            i += 1
          }
          break
        case "Android":
          window.location = `intent:${window.location.href}#Intent;end';`
          break
        default:
      }
    }
  }, [isMetaWebview, os])

  return (
    <div>
      {
        isMetaWebview && !isMetaBannerClosed && <Flex columnGap={16} style={{ 
          padding: 8, 
          position: "fixed", 
          zIndex: 200, 
          backgroundColor: Colors.BLACK, 
          width: "100%",
          boxSizing: "border-box",
          maxWidth: 500,
          borderBottom: `1px solid ${Colors.WHITE}`
        }}>
          <p 
            style={{ 
              flexShrink: 100,
              flexGrow: 0,
              color: Colors.WHITE,
            }}
          >
            You're browsing on {browser}, so some features may not work. Tap the dots on the top right and select "Open in {isIos ? "browser" : "Chrome"}" for a better experience.
          </p>
          <IconButton
            length={20}
            Icon={Cross}
            style={{ flexShrink: 0 }}
            onClick={() => setIsMetaBannerClosed(true)}
          />
        </Flex>
      }
      <Tawk />
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

        {/* Brand pages */}
        <Route path="*" element={<Brand />} />
      </Routes>
    </div>
  )
}
