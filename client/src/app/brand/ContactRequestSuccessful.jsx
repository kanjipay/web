import { Helmet } from "react-helmet-async";
import { Colors } from "../../components/CircleButton";
import Spacer from "../../components/Spacer";
import useWindowSize from "../../utils/helpers/useWindowSize";

export default function ContactRequestSuccessful() {
  const { width } = useWindowSize();
  const isMobile = width < 750

  return <div style={{ backgroundColor: Colors.OFF_BLACK, minHeight: "100vh" }}>
    <Helmet>
      <title>We'll be in touch | Mercado</title>
    </Helmet>
    <Spacer y={isMobile ? 16 : 20} />

    <h1 style={{
      color: Colors.WHITE,
      font: "700 5em Rubik, Roboto, sans-serif",
      textAlign: "center"
    }}>Thanks for reaching out!</h1>
    <Spacer y={3} />
    <p style={{
      fontSize: isMobile ? "1.1em" : "1.25em",
      textAlign: "center",
      color: Colors.WHITE
    }}>A member of our team be in contact soon with the email you provided.</p>
  </div>
}