import { useEffect, useState } from "react"
import * as base64 from "base-64"
import { sendSignInLinkToEmail } from "firebase/auth"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { Colors } from "../../enums/Colors"
import NavBar from "../../components/NavBar"
import Spacer from "../../components/Spacer"
import { validateEmail } from "../../utils/helpers/validation"
import LoadingPage from "../../components/LoadingPage"
import IconActionPage from "../../components/IconActionPage"
import Cross from "../../assets/icons/Cross"
import { auth } from "../../utils/FirebaseUtils"
import Form, { generateValidator } from "../../components/Form"
import { Field } from "../../components/input/IntField"
import { AnalyticsManager } from "../../utils/AnalyticsManager"
import { saveState } from "../../utils/services/StateService"
import { shouldShowGoogleAuth } from "./shouldShowGoogleAuth"
import Revealer from "../../components/Revealer"
import { SignInWithGoogleButton } from "./SignInWithGoogleButton"
import SignInWithAppleButton from "./SignInWithAppleButton"
import { shouldShowAppleAuth } from "./shouldShowAppleAuth"

export default function AuthPage() {
  const navigate = useNavigate()
  const { search } = useLocation()

  const [searchParams] = useSearchParams()
  const backPath = base64.decode(searchParams.get("back"))

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    AnalyticsManager.main.viewPage("Auth")
  }, [])

  const handleSignInWithApple = () => {
    navigate({ pathname: "apple", search })
  }

  const handleSignInWithGoogle = () => {
    navigate({ pathname: "google", search })
  }

  const handleTryAnotherWay = () => setError(null)

  const handleSendEmailLink = async (data) => {
    setIsLoading(true)

    const { email } = data

    const stateId = await saveState()

    const redirectUrl = new URL(window.location.href)
    redirectUrl.pathname = "/auth/email-link"
    redirectUrl.searchParams.append("stateId", stateId)

    sendSignInLinkToEmail(auth, email, {
      url: redirectUrl.href,
      handleCodeInApp: true,
    })
      .then(() => {
        localStorage.setItem("emailForSignIn", email)
        setIsLoading(false)
        navigate({ pathname: "email-link-sent", search }, { state: { email } })
      })
      .catch((error) => {
        const errorCode = error.code
        const errorMessage = error.message

        setError({
          title: "Something went wrong",
          body: "We're sorry, but we couldn't send you an email link. Try logging in a different way, or checking back later.",
        })
      })
  }

  if (error) {
    return (
      <IconActionPage
        Icon={Cross}
        iconBackgroundColor={Colors.RED_LIGHT}
        iconForegroundColor={Colors.RED}
        title={error.title}
        body={error.body}
        primaryActionTitle="Try another way"
        primaryAction={handleTryAnotherWay}
      />
    )
  } else if (isLoading) {
    return <LoadingPage />
  } else {

    return <div className="container">
      <NavBar title="Sign in" back={backPath} />

      <div className="content">
        <Spacer y={9} />

        {shouldShowAppleAuth() && (
          <div>
            <SignInWithAppleButton onClick={handleSignInWithApple} />
            <Spacer y={2} />
          </div>
        )}

        {shouldShowGoogleAuth() && (
          <div>
            <SignInWithGoogleButton onClick={handleSignInWithGoogle} />
            <Spacer y={2} />
          </div>
        )}

        <Revealer title="Email me a sign in link" name="auth">
          <Form
            isFormLoading={isLoading}
            formGroupData={[
              {
                items: [
                  {
                    name: "email",
                    validators: [generateValidator(validateEmail, "Invalid email")],
                    input: <Field type="email" autocomplete="email" />,
                  },
                ],
              },
            ]}
            onSubmit={handleSendEmailLink}
            submitTitle="Send email link"
          />
        </Revealer>

        <Spacer y={2} />
        <p className="text-caption">
          By continuing, you agree to our{" "}
          <a
            target="_blank"
            rel="noreferrer"
            href="/legal/privacy-policy"
          >
            Privacy Policy
          </a>.
        </p>

        <Spacer y={6} />
      </div>
    </div>
  }
}
