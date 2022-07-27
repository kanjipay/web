import NavBar from "../../../../../components/NavBar"
import Spacer from "../../../../../components/Spacer"
import { useLocation } from "react-router-dom"
import { useState } from "react"
import { validateEmail } from "../../../../../utils/helpers/validation"
import TextField from "../../../../../components/Input"
import MainButton from "../../../../../components/MainButton"
import {
  fetchSignInMethodsForEmail,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth"
import { useNavigate } from "react-router-dom"
import { Authentication } from "../../../../../utils/services/FirestoreAuth"

function MerchantForgotPasswordPage() {
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState(location.state || "")
  let navigate = useNavigate()
  const auth = Authentication()

  function handleEmailFieldChange(event) {
    setEmail(event.target.value)
  }

  //TODO - rate limit this
  function handleResetPassword() {
    setIsLoading(true)
    fetchSignInMethodsForEmail(auth, email)
      .then((response) => {
        if (response.includes("password")) {
          sendPasswordResetEmail(auth, email)
            .then(() => {
              setIsLoading(false)
              navigate("/merchant/login")
              //Show the user that their password reset email has been sent
            })
            .catch((err) => {
              console.log("Error", err)
            })
        } else if (response.length > 0) {
          setIsLoading(false)
          console.log("Unsupported account, please contact support")
        } else {
          setIsLoading(false)
          navigate("/merchant/signup")
        }
      })
      .catch((err) => {
        console.log("Error looking up email", err)
      })
  }

  return (
    <div className="container">
      <NavBar
        title={`Forgot password`}
        transparentDepth={0}
        opaqueDepth={0}
      />
      <Spacer y={8} />
      <div className="content">
        <p className="text-body-faded">Please enter your email</p>
        <Spacer y={3} />
        <TextField
          placeholder="Email"
          value={email}
          onChange={handleEmailFieldChange}
          type="email"
        />
        <Spacer y={2} />
        <MainButton
          title="Send password reset link"
          isLoading={isLoading}
          style={{ boxSizing: "borderBox" }}
          onClick={() => handleResetPassword()}
          disabled={!validateEmail(email)}
        ></MainButton>
      </div>
    </div>
  )
}

export default MerchantForgotPasswordPage
