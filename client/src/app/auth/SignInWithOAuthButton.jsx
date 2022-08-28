import { ButtonTheme } from "../../components/ButtonTheme";
import MainButton from "../../components/MainButton";
import { OAuthType } from "./SignInWithOAuthPage";

export default function SignInWithOAuthButton({ provider, style, ...props }) {
  let buttonTheme = provider === OAuthType.APPLE ? ButtonTheme.MONOCHROME : ButtonTheme.MONOCHROME_OUTLINED

  return <MainButton
    title={`Continue with ${provider}`}
    icon={`/img/${provider.toLowerCase()}.png`}
    buttonTheme={buttonTheme}
    test-id={`${provider.toLowerCase()}-auth-button`}
    style={style}
    {...props}
  />
}