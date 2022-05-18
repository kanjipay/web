import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TextField from "../../components/Input";
import MainButton from "../../components/MainButton";
import NavBar from "../../components/NavBar";
import Spacer from "../../components/Spacer";
import { auth } from "../../utils/FirebaseUtils";
import { validateEmail } from "../../utils/helpers/validation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSendPasswordResetEmail = () => {
    setIsLoading(true)

    const redirectUrl = new URL(window.location.href)
    redirectUrl.pathname = "/auth/redirect"
    
    sendPasswordResetEmail(auth, email, {
      url: redirectUrl.href,
      handleCodeInApp: true
    }).then(() => {
      setIsLoading(false)
      navigate("password-reset-sent")
    })
  }

  return <div className="container">
    <NavBar
      title="Forgot password"
      backPath="/auth"
    />
    <div className="content">
      <Spacer y={9} />

      <p className="text-body-faded">Enter the email address you have an account with. We'll send you a password reset link if the account exists.</p>
      <Spacer y={2} />
      <h4 className="header-xs">Email address</h4>
      <Spacer y={2} />
      <TextField
        name="email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <Spacer y={2} />
      <MainButton 
        title="Send password reset email" 
        onClick={handleSendPasswordResetEmail} 
        isLoading={isLoading}
        disabled={!validateEmail(email)}
      />
    </div>

  </div>
}