import { Helmet } from "react-helmet-async";
import "./HomePage.css";
import useWindowSize from "../../utils/helpers/useWindowSize";
import Spacer from "../../components/Spacer";

export default function Home() {
  const { width } = useWindowSize();

  return (
    <div className="Home">
      <Helmet>
        <title>Home</title>
      </Helmet>

      <header className="Home__header">
        <div className="Home__headerContainer">
          <h2 className="Home__headerLogo">Mercado</h2>
        </div>
      </header>

      <Spacer y={8} />
      <div className="Home__content">
        <h1 className="Home__title">
          Bring your menu <span className="Home__titleHighlight">online</span>
        </h1>
        <p className="Home__salesCopy">
          Mercado is an online menu for food stalls.
        </p>
        <Spacer y={2} />
        <p className="Home__salesCopy">
          No set up fees. No subscription. All you need is a QR code.
        </p>
        <Spacer y={2} />
        <img
          src={`/img/screenshots_${width > 500 ? "desktop" : "mobile"}.png`} // change to mobile after putting screenshots
          alt=""
          className="Home__screenshots"
        />
      </div>

      <footer className="Home__footer"></footer>
    </div>
  );
}
