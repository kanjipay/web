import { Route, Routes } from "react-router-dom";
import AuthPage from "./AuthPage";
import EmailLinkPage from "./EmailLinkPage";
import EmailLinkSentPage from "./EmailLinkSentPage";
import SignInWithGooglePage from "./SignInWithGooglePage";

export default function Auth() {
  return <Routes>
    <Route path="/" element={<AuthPage />} />
    <Route path="/email-link" element={<EmailLinkPage />} />
    <Route path="/email-link-sent" element={<EmailLinkSentPage />} />
    <Route path="/google" element={<SignInWithGooglePage />} />
  </Routes>
}