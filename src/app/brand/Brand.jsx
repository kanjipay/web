import { useEffect } from "react";
import { Link, Route, Routes } from "react-router-dom";
import { Colors } from "../../components/CircleButton";
import MainButton from "../../components/MainButton";
import Spacer from "../../components/Spacer";
import useWindowSize from "../../utils/helpers/useWindowSize";
import NotFound from "../shared/NotFoundPage";
import { BookDemoPage } from "./BookDemoPage";
import HomePage from "./HomePage";
import "./HomePage.css";

export function Brand() {
  const { width } = useWindowSize();
  const isMobile = width < 750

  useEffect(() => {
    var s1 = document.createElement("script"), s0 = document.getElementsByTagName("script")[0];
    s1.async = true;
    s1.src = 'https://embed.tawk.to/62457ae70bfe3f4a8770acd2/1fvfmg6kk';
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    s0.parentNode.insertBefore(s1, s0);
  }, [])

  return <div style={{ backgroundColor: Colors.PRIMARY_LIGHT}}>
    <header style={{ padding: 16 }}>
      <div style={{ margin: "auto", maxWidth: 1200, display: "flex", alignItems: "center" }}>
        <Link to="/">
          <h2 className="Home__headerLogo" style={{ fontSize: isMobile ? "2rem" : "3rem" }}>Mercado</h2>
        </Link>
        
        <div className="flex-spacer"></div>

        <Link to="book-demo">
          <MainButton title="Book a demo" style={{ display: "inline-block", width: 140 }} />
        </Link>
        
      </div>
    </header>

    <Spacer y={6} />
    <div style={{
      margin: "auto",
      maxWidth: 1080,
      padding: "0 16px",
      minHeight: "60vh"
    }}>
      <Routes>
        <Route path="/book-demo" element={<BookDemoPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>

    <Spacer y={12} />

    <footer style={{ backgroundColor: Colors.PRIMARY_LIGHT_SHADED }}>
      <div style={{
        margin: "auto",
        maxWidth: 1200,
        padding: "64px 16px"
      }}>
        <p>Copyright 2022 Kanjipay Ltd. All rights reserved. Company number: 13931899.</p>
      </div>
    </footer>
  </div>
}