import { useState } from "react"
import { useEffect } from "react"
import { isMobile } from "react-device-detect"
import { Link, Route, Routes } from "react-router-dom"
import { ButtonTheme } from "../../components/ButtonTheme"
import FlexSpacer from "../../components/layout/FlexSpacer"
import { Flex } from "../../components/Listing"
import MobilePopupMenu from "../../components/MobilePopupMenu"
import SmallButton from "../../components/SmallButton"
import { Colors } from "../../enums/Colors"
import useWindowSize from "../../utils/helpers/useWindowSize"
import Legal from "../legal/Legal"
import NotFound from "../shared/NotFoundPage"
import FAQsPage from "./FAQsPage"
import Footer from "./Footer"
import HomePage from "./HomePage"
import PricingPage from "./PricingPage"

export function opacityToAlphaHex(opacity) {
  let boundedOpacity

  if (opacity > 1) {
    boundedOpacity = 1
  } else if (opacity < 0) {
    boundedOpacity = 0
  } else {
    boundedOpacity = opacity
  }

  const opacityInt = Math.round(boundedOpacity * 255)
  const alphaInt = 255 - opacityInt

  let alphaHexString = alphaInt.toString(16)

  if (alphaHexString.length === 1) {
    alphaHexString = "0" + alphaHexString
  }

  return alphaHexString
}

function BrandNavBar({ isSeeThrough = false }) {
  const foregroundColor = isSeeThrough ? Colors.WHITE : Colors.BLACK
  return <header
    style={{
      padding: "8px 8px 8px 16px",
      boxSizing: "border-box",
      position: "fixed",
      zIndex: 100,
      width: "100%",
      backgroundColor: isSeeThrough ? Colors.CLEAR : Colors.WHITE + "fa",
    }}
  >
    <Flex columnGap={16} style={{
      margin: "auto",
      maxWidth: 1200,
    }}>
      <Link to="/">
        <h2
          style={{
            fontFamily: "Rubik, Roboto, sans-serif",
            fontWeight: 600,
            fontSize: isMobile ? "1.5rem" : "2rem",
            color: foregroundColor
          }}
        >
          Mercado
        </h2>
      </Link>

      {!isMobile && <Link to="/pricing" style={{ marginLeft: 16, color: foregroundColor }}>Pricing</Link>}
      <FlexSpacer />
      {!isMobile && <Link to="/events/s/tickets">
        <SmallButton
          title="Event goers"
          buttonTheme={isSeeThrough ? ButtonTheme.MONOCHROME_REVERSED: ButtonTheme.MONOCHROME}
        />
      </Link>}

      {!isMobile && <Link to="/dashboard">
        <SmallButton
          title="Organisers"
          buttonTheme={isSeeThrough ? ButtonTheme.MONOCHROME_OUTLINED_REVERSE : ButtonTheme.MONOCHROME_OUTLINED}
        />
      </Link>}

      {isMobile && <MobilePopupMenu
        navItems={[
          {
            title: "Home",
            path: "/"
          },
          {
            title: "Pricing",
            path: "/pricing"
          },
          {
            title: "Event goers",
            path: "/events/s/tickets"
          },
          {
            title: "Organisers",
            path: "/dashboard"
          }
        ]}
        buttonTheme={isSeeThrough ? ButtonTheme.MONOCHROME : ButtonTheme.MONOCHROME_REVERSED}
      />}
    </Flex>
  </header>
}

export function Brand() {
  const { height } = useWindowSize()

  function scrolledPast() {
    return window.scrollY > (isMobile ? height * 0.4 - 64 : height - 64)
  }

  const [hasScrolledPast, setHasScrolledPast] = useState(scrolledPast())

  const handleScroll = () => setHasScrolledPast(scrolledPast())

  useEffect(() => {
    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  })
  return (
    <div>
      <Routes>
        <Route path="/" element={<BrandNavBar isSeeThrough={!hasScrolledPast} />} />
        <Route path="*" element={<BrandNavBar />}/>
      </Routes>
      <div
        style={{
          margin: "auto",
          minHeight: "90vh",
        }}
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/:customerSegmentId" element={<HomePage />} />
          <Route path="/faqs" element={<FAQsPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/legal/*" element={<Legal />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      <Footer />
    </div>
  )
}
