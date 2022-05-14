import { addDoc } from "firebase/firestore";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Colors } from "../../components/CircleButton";
import Spacer from "../../components/Spacer";
import Collection from "../../enums/Collection";
import useWindowSize from "../../utils/helpers/useWindowSize";
import { validateEmail } from "../../utils/helpers/validation";
import BlockButton from "./BlockButton";
import "./HomePageOld.css";

export function LabelledField({ label, value, onChange, isRequired = true, ...props }) {
  return <label style={{
    backgroundColor: Colors.OFF_BLACK_LIGHT,
    height: 64,
    position: "relative",
    overflow: "hidden",
    ...props
  }}>
    <input value={value} onChange={onChange} style={{
      position: "absolute",
      backgroundColor: Colors.OFF_BLACK_LIGHT,
      color: Colors.WHITE,
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      padding: "16px 16px 0 16px"
    }}/>

    <p style={{
      color: Colors.GRAY_LIGHT,
      fontSize: 13,
      position: "absolute",
      top: 12,
      left: 16

    }}>{`${label}${isRequired ? " *" : ""}`}</p>
    
  </label>
}

export function BookDemoPage() {
  const { width } = useWindowSize();
  const isMobile = width < 750
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [provider, setProvider] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const isFormComplete = validateEmail(email) && companyName.length > 0

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsLoading(true)

    addDoc(Collection.CONTACT_REQUEST.ref, {
      reason: "demo",
      createdAt: new Date(),
      email,
      companyName,
      provider
    }).then(res => {
      setIsLoading(false)
      navigate("/contact-success")
    })
  }

  return <div style={{ backgroundColor: Colors.OFF_BLACK, minHeight: "100vh" }}>
    <Helmet>
      <title>Book a demo | Mercado</title>
    </Helmet>
    <Spacer y={isMobile ? 16 : 20} />
    <div style={{ margin: "auto", maxWidth: 1200, padding: "0 16px" }}>
      <div style={{
        height: isMobile ? "auto" : 500,
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        columnGap: 64,
      }}>
        <div style={{ textAlign: isMobile ? "center" : "left" }}>
          <h1 style={{
            fontSize: isMobile ? "2rem" : "5rem",
            color: Colors.WHITE,
            fontFamily: "Rubik, Roboto, sans-serif",
            fontWeight: 600
          }}>Book your free demo</h1>
          <Spacer y={3} />
          <p style={{ fontSize: "1.25rem", color: Colors.GRAY_LIGHT }}>
            We’ll talk you through how our events management platform works for customers and staff, and answer any questions you have. There’s no obligation to buy.
          </p>
          <Spacer y={3} />
        </div>

        <div>
          <form onSubmit={handleSubmit} id="demo-form" style={{
            display: "grid",
            rowGap: 16,
          }}>
            <LabelledField
              label="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <LabelledField
              label="Company name"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
            />
            <LabelledField
              label="Current provider"
              isRequired={false}
              value={provider}
              onChange={e => setProvider(e.target.value)}
            />
          </form>
          <Spacer y={2} />
          <BlockButton
            title="Book my demo"
            isLoading={isLoading}
            disabled={!isFormComplete}
            type="submit"
            form="demo-form"
            value="Submit"
          />
        </div>
      </div>
    </div>

  </div>
}