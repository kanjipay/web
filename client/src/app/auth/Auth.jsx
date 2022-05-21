import { Route, Routes } from "react-router-dom";
import Tick from "../../assets/icons/Tick";
import IconPage from "../../components/IconPage";
import AuthPage from "./AuthPage";
import EmailLinkPage from "./EmailLinkPage";
import ForgotPasswordPage from "./ForgotPasswordPage";
import RedirectPage from "./RedirectPage";
import SignInWithGooglePage from "./SignInWithGooglePage";

export default function Auth() {
  return <Routes>
    <Route path="/" element={<AuthPage />} />
    <Route path="email-link" element={<EmailLinkPage />} />
    <Route path="forgot-password" element={<ForgotPasswordPage />} />
    <Route path="redirect" element={<RedirectPage />} />
    <Route path="google" element={<SignInWithGooglePage />} />

    <Route path="email-link-sent" element={<IconPage
      Icon={Tick}
      title="Email link sent"
      body="We sent you an email link for you to sign in. It may take a moment to arrive."
    />} />
    <Route path="verification-link-sent" element={<IconPage
      Icon={Tick}
      title="Verification link sent"
      body="We sent you a verification email. Please follow the link contained in this email to continue"
    />} />
    <Route path="password-reset-sent" element={<IconPage
      Icon={Tick}
      title="Check your inbox"
      body="If your account exists, we'll have sent you a password reset email. It may take a moment to arrive."
    />} />
  </Routes>
}