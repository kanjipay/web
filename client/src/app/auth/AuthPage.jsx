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
import { shouldShowAppleAuth } from "./shouldShowAppleAuth"
import SignInWithOAuthButton from "./SignInWithOAuthButton"
import { OAuthType } from "./SignInWithOAuthPage"
import MainButton from "../../components/MainButton"
import { ButtonTheme } from "../../components/ButtonTheme"

export default function AuthPage() {
  const navigate = useNavigate()
  const { search, state } = useLocation()

  const [searchParams] = useSearchParams()
  const backPath = base64.decode(searchParams.get("back"))

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [emailForLink, setEmailForLink] = useState(state?.emailForLink)

  const lastAuthType = localStorage.getItem("lastAuthType")

  useEffect(() => {
    AnalyticsManager.main.viewPage("Auth")
  }, [])

  const handleSignInWithApple = () => {
    navigate({ pathname: "apple", search })
  }

  const handleSignInWithGoogle = () => {
    navigate({ pathname: "google", search })
  }

  const handleSignInWithFacebook = () => {
    navigate({ pathname: "facebook", search })
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

  useEffect(() => {
    if (emailForLink && !isLoading) {
      setEmailForLink(null)
      
      async function signInWEmail() {
        setIsLoading(true)

        const email = emailForLink

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

      signInWEmail()
    }
  }, [emailForLink, isLoading, navigate, search])

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
      <NavBar title="Log in or sign up" back={backPath} />

      <div className="content">
        <Spacer y={9} />

        {
          lastAuthType && <div>
            <p className="text-body-faded">You previously signed in with {lastAuthType}.</p>
            <Spacer y={3} />
          </div>
        }

        {shouldShowAppleAuth() && (
          <div>
            <SignInWithOAuthButton provider={OAuthType.APPLE} onClick={handleSignInWithApple} />
            <Spacer y={2} />
          </div>
        )}

        {shouldShowGoogleAuth() && (
          <div>
            <SignInWithOAuthButton provider={OAuthType.GOOGLE} onClick={handleSignInWithGoogle} />
            <Spacer y={2} />
          </div>
        )}

        <SignInWithOAuthButton provider={OAuthType.FACEBOOK} onClick={handleSignInWithFacebook} />
        <Spacer y={2} />

        <Revealer 
          trigger={<MainButton 
            title="Email me a sign in link"
            icon="/img/emailLink.png"
            buttonTheme={ButtonTheme.MONOCHROME_OUTLINED}
          />}
        >
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
