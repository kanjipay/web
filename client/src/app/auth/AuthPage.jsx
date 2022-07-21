import { useEffect, useState } from "react"
import * as base64 from "base-64"
import { onAuthStateChanged, sendSignInLinkToEmail } from "firebase/auth"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { Colors } from "../../enums/Colors"
import NavBar from "../../components/NavBar"
import OrDivider from "../../components/OrDivider"
import Spacer from "../../components/Spacer"
import { validateEmail } from "../../utils/helpers/validation"
import LoadingPage from "../../components/LoadingPage"
import IconActionPage from "../../components/IconActionPage"
import Cross from "../../assets/icons/Cross"
import { auth } from "../../utils/FirebaseUtils"
import Form, { generateValidator } from "../../components/Form"
import { Field, FieldDecorator } from "../../components/input/IntField"
import { AnalyticsManager } from "../../utils/AnalyticsManager"
import { saveState } from "../../utils/services/StateService"
import { shouldShowGoogleAuth } from "./shouldShowGoogleAuth"
import Revealer from "../../components/Revealer"
import { SignInWithGoogleButton } from "./SignInWithGoogleButton"
import SignInWithAppleButton from "./SignInWithAppleButton"
import { shouldShowAppleAuth } from "./shouldShowAppleAuth"

export default function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { search } = useLocation()

  // const requiresPassword = location.state?.requiresPassword ?? false
  const requiredEmailDomain = location.state?.requiredEmailDomain

  let emailSuffix = requiredEmailDomain ? `@${requiredEmailDomain}` : ""

  const [searchParams] = useSearchParams()
  const [backPath, successPath] = ["back", "success"].map((e) =>
    base64.decode(searchParams.get(e))
  )
  // const successState = JSON.parse(base64.decode(searchParams.get("state")))

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    AnalyticsManager.main.viewPage("Auth")
  }, [])

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setIsLoading(false)
      setUser(user)
    })
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
    const emailLinkForm = (
      <Form
        isFormLoading={isLoading}
        formGroupData={[
          {
            items: [
              {
                name: "email",
                validators: [generateValidator(validateEmail, "Invalid email")],
                decorator: <FieldDecorator suffix={emailSuffix} />,
                input: <Field type="email" autocomplete="email" />,
              },
            ],
          },
        ]}
        onSubmit={handleSendEmailLink}
        submitTitle="Send email link"
      />
    )

    return (
      <div className="container">
        <NavBar title="Sign in" backPath={backPath} />

        <div className="content">
          <Spacer y={9} />

          {(shouldShowGoogleAuth() || shouldShowAppleAuth()) &&
          !requiredEmailDomain ? (
            <div>
              <div>
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
              </div>

              <Revealer title="Email me a sign in link" name="auth">
                {emailLinkForm}
              </Revealer>

              <Spacer y={6} />
            </div>
          ) : (
            emailLinkForm
          )}
        </div>
      </div>
    )
  }
}
