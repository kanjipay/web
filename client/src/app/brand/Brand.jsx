import { useEffect, useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import { Colors } from "../../components/CircleButton";
import useWindowSize from "../../utils/helpers/useWindowSize";
import NotFound from "../shared/NotFoundPage";
import BlockButton from "./BlockButton";
import { BookDemoPage } from "./BookDemoPage";
import ContactRequestSuccessful from "./ContactRequestSuccessful";
import HomePage from "./HomePage";
import "./HomePageOld.css";

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
  const { width } = useWindowSize();
  const isMobile = width < 750
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const opaqueDepth = 0
      const transparentDepth = 20
      const yOffset = window.scrollY;
      const newOpacity = Math.max(
        Math.min(
          (yOffset - transparentDepth) / (opaqueDepth - transparentDepth),
          1
        ),
        0
      );

      setOpacity(newOpacity);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // useEffect(() => {
  //   var s1 = document.createElement("script"), s0 = document.getElementsByTagName("script")[0];
  //   s1.async = true;
  //   s1.src = 'https://embed.tawk.to/62457ae70bfe3f4a8770acd2/1fvfmg6kk';
  //   s1.charset = 'UTF-8';
  //   s1.setAttribute('crossorigin', '*');
  //   s0.parentNode.insertBefore(s1, s0);
  // }, [])

  const calendlyLink = "https://calendly.com/matt-at-mercado/demo"

  return <div>
    <header style={{ 
      padding: 16, 
      boxSizing: "border-box", 
      position: "fixed", 
      zIndex: 100, 
      width: "100%", 
      backgroundColor: Colors.BLACK + opacityToAlphaHex(opacity)
    }}>
      <div style={{ margin: "auto", maxWidth: 1200, display: "flex", alignItems: "center" }}>
        <Link to="/">
          <h2 style={{
            fontFamily: "Oswald, Roboto, sans-serif",
            fontWeight: 600,
            fontSize: isMobile ? "2rem" : "3rem",
            color: Colors.WHITE
          }}>Mercado</h2>
        </Link>
        
        <div className="flex-spacer"></div>

        

        <a href={calendlyLink} target="_blank" rel="noreferrer">
          <BlockButton title="Book a demo" style={{ display: "inline-block", width: 140 }} />
        </a>
        
      </div>
    </header>

    <div style={{
      margin: "auto",
      minHeight: "90vh"
    }}>
      <Routes>
        <Route path="/book-demo" element={<BookDemoPage />} />
        <Route path="/contact-success" element={<ContactRequestSuccessful />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/:customerSegmentId" element={<HomePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>

    <footer style={{ backgroundColor: Colors.BLACK }}>
      <div style={{
        margin: "auto",
        maxWidth: 1200,
        padding: "64px 16px"
      }}>
        <p style={{ color: Colors.WHITE}}>Copyright 2022 Kanjipay Ltd. All rights reserved. Company number: 13931899.</p>
      </div>
    </footer>
  </div>
}