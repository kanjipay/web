import { Route, Routes } from "react-router-dom";
import Tick from "../../assets/icons/Tick";
import { Colors } from "../../components/CircleButton";
import IconPage from "../../components/IconPage";
import AuthPage from "./AuthPage";
import EmailLinkPage from "./EmailLinkPage";
import EmailLinkSentPage from "./EmailLinkSentPage";
import ForgotPasswordPage from "./ForgotPasswordPage";
import PasswordResetSentPage from "./PasswordResetSentPage";
import RedirectPage from "./RedirectPage";
import SignInWithGooglePage from "./SignInWithGooglePage";
import VerificationLinkSentPage from "./VerificationLinkSentPage";

export default function Auth() {
  return <div style={{ backgroundColor: Colors.OFF_WHITE_LIGHT }}>
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="email-link" element={<EmailLinkPage />} />
      <Route path="forgot-password" element={<ForgotPasswordPage />} />
      <Route path="redirect" element={<RedirectPage />} />
      <Route path="google" element={<SignInWithGooglePage />} />

      <Route path="email-link-sent" element={<EmailLinkSentPage />} />
      <Route path="verification-link-sent" element={<VerificationLinkSentPage />} />
      <Route path="password-reset-sent" element={<PasswordResetSentPage />} />
    </Routes>
  </div>
}