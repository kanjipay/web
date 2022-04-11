import { addDoc } from "firebase/firestore";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Colors } from "../../components/CircleButton";
import MainButton from "../../components/MainButton";
import Spacer from "../../components/Spacer";
import Collection from "../../enums/Collection";
import useWindowSize from "../../utils/helpers/useWindowSize";
import { validateEmail } from "../../utils/helpers/validation";
import "./HomePage.css";

export function LabelledField({ label, value, onChange, isRequired = true, ...props }) {
  return <label style={{
    backgroundColor: Colors.WHITE,
    borderRadius: 16,
    height: 64,
    position: "relative",
    overflow: "hidden",
    ...props
  }}>
    <input value={value} onChange={onChange} style={{
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      padding: "12px 16px 0 16px"
    }}/>

    <p style={{
      color: Colors.PRIMARY,
      fontSize: 13,
      position: "absolute",
      top: 8,
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
  const [menuProvider, setMenuProvider] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const isFormComplete = validateEmail(email) && companyName.length > 0

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("abc")
    setIsLoading(true)

    addDoc(Collection.CONTACT_REQUEST.ref, {
      reason: "demo",
      createdAt: new Date(),
      email,
      companyName,
      menuProvider
    }).then(res => {
      console.log("done")

      setIsLoading(false)


      navigate("..")
    })
  }

  return <div style={{
    height: isMobile ? "auto" : 500,
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
    columnGap: 32,
  }}>
    <div style={{ textAlign: isMobile ? "center" : "left" }}>
      <h1 className="Home__headingLarge" style={{ 
        fontSize: isMobile ? "2rem" : "5rem",
      }}>Book your free demo</h1>
      <Spacer y={3} />
      <p style={{ fontSize: "1.25rem" }}>
        We’ll talk you through how the menu works for the customer and for staff, and answer any questions you have. There’s no obligation to buy.
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
          label="Current menu provider" 
          isRequired={false}
          value={menuProvider}
          onChange={e => setMenuProvider(e.target.value)}
        />
      </form>
      <Spacer y={2} />
      <MainButton
        title="Book my demo"
        isLoading={isLoading}
        disabled={!isFormComplete}
        type="submit"
        form="demo-form"
        value="Submit"
      />
    </div>
  </div>
}