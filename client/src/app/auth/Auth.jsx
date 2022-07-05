import { Route, Routes } from "react-router-dom"
import { Colors } from "../../enums/Colors"
import AuthPage from "./AuthPage"
import EmailLinkPage from "./EmailLinkPage"
import EmailLinkSentPage from "./EmailLinkSentPage"
import ForgotPasswordPage from "./ForgotPasswordPage"
import PasswordResetSentPage from "./PasswordResetSentPage"
import RedirectPage from "./RedirectPage"
import SignInWithGooglePage from "./SignInWithGooglePage"
import VerificationLinkSentPage from "./VerificationLinkSentPage"

export default function Auth() {
  return (
    <div style={{ backgroundColor: Colors.OFF_WHITE_LIGHT }}>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="email-link" element={<EmailLinkPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="redirect" element={<RedirectPage />} />
        <Route path="google" element={<SignInWithGooglePage />} />

        <Route path="email-link-sent" element={<EmailLinkSentPage />} />
        <Route
          path="verification-link-sent"
          element={<VerificationLinkSentPage />}
        />
        <Route path="password-reset-sent" element={<PasswordResetSentPage />} />
      </Routes>
    </div>
  )
}
