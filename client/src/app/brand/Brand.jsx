import { useEffect, useState } from "react"
import { Link, Route, Routes } from "react-router-dom"
import { ButtonTheme } from "../../components/ButtonTheme"
import MobilePopupMenu from "../../components/MobilePopupMenu"
import SmallButton from "../../components/SmallButton"
import { Colors } from "../../enums/Colors"
import useWindowSize from "../../utils/helpers/useWindowSize"
import NotFound from "../shared/NotFoundPage"
import HomePage from "./HomePage"
import "./HomePageOld.css"

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

export function Brand() {
  const { width } = useWindowSize()
  const isMobile = width < 750
  const [opacity, setOpacity] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const opaqueDepth = 0
      const transparentDepth = 20
      const yOffset = window.scrollY
      const newOpacity = Math.max(
        Math.min(
          (yOffset - transparentDepth) / (opaqueDepth - transparentDepth),
          1
        ),
        0
      )

      setOpacity(newOpacity)
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <div>
      <header
        style={{
          padding: 16,
          boxSizing: "border-box",
          position: "fixed",
          zIndex: 100,
          width: "100%",
          backgroundColor: Colors.BLACK + opacityToAlphaHex(opacity),
        }}
      >
        <div
          style={{
            margin: "auto",
            columnGap: 16,
            maxWidth: 1200,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Link to="/">
            <h2
              style={{
                fontFamily: "Oswald, Roboto, sans-serif",
                fontWeight: 600,
                fontSize: isMobile ? "2rem" : "2rem",
                color: Colors.WHITE,
              }}
            >
              Mercado
            </h2>
          </Link>

          <div className="flex-spacer"></div>

          {
            !isMobile && <Link to="/events/s/tickets">
              <SmallButton
                title="Event goers"
                buttonTheme={ButtonTheme.MONOCHROME_REVERSED}
              />
            </Link>
          }

          {
            !isMobile && <Link to="/dashboard">
              <SmallButton
                title="Organisers"
                buttonTheme={ButtonTheme.MONOCHROME_OUTLINED_REVERSE}
              />
            </Link>
          }

          {
            isMobile && <MobilePopupMenu navItems={[
              {
                title: "Event goers",
                path: "/events/s/tickets"
              },
              {
                title: "Organisers",
                path: "/dashboard"
              }
            ]} />
          }
        </div>
      </header>

      <div
        style={{
          margin: "auto",
          minHeight: "90vh",
        }}
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/:customerSegmentId" element={<HomePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      <footer style={{ backgroundColor: Colors.BLACK }}>
        <div
          style={{
            margin: "auto",
            maxWidth: 1200,
            padding: "64px 16px",
          }}
        >
          <p style={{ color: Colors.WHITE }}>
            Copyright 2022 Kanjipay Ltd. All rights reserved. Company number:
            13931899.
          </p>
        </div>
      </footer>
    </div>
  )
}
