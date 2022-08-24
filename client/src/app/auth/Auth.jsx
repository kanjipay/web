import { Route, Routes } from "react-router-dom"
import { Colors } from "../../enums/Colors"
import AuthPage from "./AuthPage"
import EmailLinkPage from "./EmailLinkPage"
import EmailLinkSentPage from "./EmailLinkSentPage"
import RedirectPage from "./RedirectPage"
import SignInWithOAuthPage, { OAuthType } from "./SignInWithOAuthPage"

export class AuthType {
  static EMAIL = "Email link"
  static FACEBOOK = OAuthType.FACEBOOK
  static APPLE = OAuthType.APPLE
  static GOOGLE = OAuthType.GOOGLE
}

export default function Auth() {
  return (
    <div style={{ backgroundColor: Colors.OFF_WHITE_LIGHT }}>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="email-link" element={<EmailLinkPage />} />
        <Route path="redirect" element={<RedirectPage />} />
        <Route
          path="apple"
          element={<SignInWithOAuthPage type={OAuthType.APPLE} />}
        />
        <Route
          path="google"
          element={<SignInWithOAuthPage type={OAuthType.GOOGLE} />}
        />
        <Route
          path="facebook"
          element={<SignInWithOAuthPage type={OAuthType.FACEBOOK} />}
        />
        <Route path="email-link-sent" element={<EmailLinkSentPage />} />
      </Routes>
    </div>
  )
}
