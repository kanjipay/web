import { useState } from "react"
import TextField from "../../../../../components/Input"
import NavBar from "../../../../../components/NavBar"
import Spacer from "../../../../../components/Spacer"
import MainButton from "../../../../../components/MainButton"
import { validateEmail } from "../../../../../utils/helpers/validation"
import {
  fetchSignInMethodsForEmail,
  signInWithEmailAndPassword,
} from "firebase/auth"
import { Authentication } from "../../../../../utils/services/FirestoreAuth"
import { useNavigate } from "react-router-dom"
import ResultBanner, {
  ResultType,
} from "../../../../../components/ResultBanner"
import { Colors } from "../../../../../enums/Colors"

function MerchantLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [validEmail, setValidEmail] = useState(false)
  const [showPasswordInput, setShowPasswordInput] = useState(false)
  const [wrongPassword, setWrongPassword] = useState(false)
  let navigate = useNavigate()

  const auth = Authentication()

  function handleEmailFieldChange(event) {
    setEmail(event.target.value)
    setValidEmail(validateEmail(email))
  }
  function handlePasswordFieldChange(event) {
    setPassword(event.target.value)
  }

  function handleEmailSubmission() {
    setIsLoading(true)
    fetchSignInMethodsForEmail(auth, email)
      .then((response) => {
        setIsLoading(false)
        if (response.includes("password")) {
          setShowPasswordInput(true)
        } else if (response.length > 0) {
          console.log("Unsupported account, please contact support")
        } else {
          navigate("/merchant/signup")
        }
      })
      .catch((err) => {
        setIsLoading(false)
        console.log("Error", err)
      })
  }

  function handlePasswordSubmission() {
    setIsLoading(true)
    signInWithEmailAndPassword(auth, email, password)
      .then((response) => {
        setIsLoading(false)
        setWrongPassword(false)
        localStorage.setItem("Auth_Token", response._tokenResponse.refreshToken)
        navigate("/merchant/dashboard")
      })
      .catch((err) => {
        setIsLoading(false)
        setWrongPassword(true)
        console.log("Authentication error")
      })
  }

  return (
    <div className="container">
      <NavBar
        title={`Sign in`}
        transparentDepth={0}
        opaqueDepth={0}
        showsBackButton={false}
      />
      <Spacer y={8} />

      <div className="content">
        <div style={{ margin: "auto" }}>
          <p className="text-body-faded">
            Please enter your {showPasswordInput ? "password" : "email"}
          </p>
        </div>
        <Spacer y={5} />
        <TextField
          value={email}
          onChange={handleEmailFieldChange}
          type="email"
        />
        <Spacer y={2} />
        {showPasswordInput ? (
          <div>
            <TextField
              value={password}
              onChange={handlePasswordFieldChange}
              type="password"
            />
            <Spacer y={2} />

            <MainButton
              title="Sign In"
              isLoading={isLoading}
              style={{ boxSizing: "borderBox" }}
              onClick={() => handlePasswordSubmission()}
              disabled={password.length < 6}
            ></MainButton>

            <Spacer y={3} />

            {wrongPassword ? (
              <ResultBanner
                resultType={ResultType.ERROR}
                message="Incorrect password, please try again"
              />
            ) : (
              <div />
            )}
          </div>
        ) : (
          <MainButton
            title="Next"
            isLoading={isLoading}
            style={{ boxSizing: "borderBox" }}
            onClick={() => handleEmailSubmission()}
            disabled={!validEmail}
          ></MainButton>
        )}

        <Spacer y={8} />
        <MainButton
          title="Forgot password?"
          style={{
            boxSizing: "borderBox",
            color: Colors.PRIMARY,
            backgroundColor: Colors.WHITE,
          }}
          onClick={() =>
            navigate("/merchant/forgot-password", { state: email })
          }
        ></MainButton>
      </div>
    </div>
  )
}

export default MerchantLogin
