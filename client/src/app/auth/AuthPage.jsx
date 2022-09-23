import { useEffect, useState } from "react"
import * as base64 from "base-64"
import { sendSignInLinkToEmail } from "firebase/auth"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { Colors } from "../../enums/Colors"
import NavBar from "../../components/NavBar"
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
import { Container } from "../brand/FAQsPage"
import Content from "../../components/layout/Content"

export function FixedBottom({ children, padding = 16, style, ...props }) {
  return <div style={{ 
    position: "fixed", 
    bottom: 0,
    maxWidth: "inherit",
    zIndex: 100,
    width: "100%",
    boxSizing: "border-box",
    padding,
    ...style
  }} {...props}>
    {children}
  </div>
}

export function Caption({ children, style, ...props }) {
  return <p 
    style={{
      fontSize: 12,
      color: Colors.GRAY_LIGHT,
      ...style
    }}
    {...props}
  >
    {children}
  </p>
}

export function Body({ children, isFaded, style, ...props }) {
  return <p
    style={{
      fontSize: 16,
      color: isFaded ? Colors.GRAY_LIGHT : Colors.BLACK,
      fontFamily: "Roboto, sans-serif",
      ...style
    }}
    {...props}
  >
    {children}
  </p>
}

export function FeedbackProvider({ children, isInline = false, style, ...props }) {
  const [isHovering, setIsHovering] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  return <div
    onMouseEnter={() => setIsHovering(true)}
    onMouseLeave={() => setIsHovering(false)}
    onMouseDown={() => setIsPressed(true)}
    onMouseUp={() => setIsPressed(false)}
    onTouchStart={() => setIsPressed(true)}
    onTouchEnd={() => setIsPressed(false)}
    style={{
      display: "inline",
      cursor: "pointer",
      ...style
    }}
    {...props}
  >
    {children(isHovering, isPressed)}
  </div>
}

export function Anchor({ children, href, newTab = true, isDark = false, style, ...props }) {
  if (newTab) {
    props["rel"] = "noreferrer"
    props["target"] = "_blank"
  }

  return <FeedbackProvider isInline>{(isHovering) => <a
    href={href}
    style={{
      textDecoration: "none",
      color: isDark ? (isHovering ? Colors.WHITE : Colors.OFF_WHITE) : (isHovering ? Colors.GRAY : Colors.BLACK),
      fontWeight: 600,
      ...style
    }}
    {...props}
  >
    {children}
  </a>}</FeedbackProvider>
}



export default function AuthPage() {
  const navigate = useNavigate()
  const { search, state } = useLocation()

  const [searchParams] = useSearchParams()
  const backPath = base64.decode(searchParams.get("back"))

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [emailForLink, setEmailForLink] = useState(state?.emailForLink)

  const message = state?.message

  const lastAuthType = localStorage.getItem("lastAuthType")

  useEffect(() => AnalyticsManager.main.viewPage("Auth"), [])

  const handleSignInWithApple = () => navigate({ pathname: "apple", search })
  const handleSignInWithGoogle = () => navigate({ pathname: "google", search })
  const handleTryAnotherWay = () => setError(null)

  const handleSendEmailLink = async (data) => {
    AnalyticsManager.main.pressButton("SendEmailLink")
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

  let topText = []

  if (message) { topText.push(message)}
  if (lastAuthType) { topText.push(`You previously logged in with ${lastAuthType}.`)}

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
    return <Container>
      <NavBar title="Log in or sign up" back={backPath} />

      <Content>
        {topText.length > 0 && <Body style={{ marginBottom: 24 }}>{topText.join(" ")}</Body>}

        {shouldShowAppleAuth() && <SignInWithOAuthButton
          provider={OAuthType.APPLE}
          onClick={handleSignInWithApple}
          style={{ marginBottom: 16 }}
        />}

        {shouldShowGoogleAuth() && <SignInWithOAuthButton
          provider={OAuthType.GOOGLE}
          onClick={handleSignInWithGoogle}
          style={{ marginBottom: 16 }}
        />}

        {!shouldShowAppleAuth() && !shouldShowGoogleAuth() ?
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
          /> :
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
        }
      </Content>

      {!lastAuthType && <FixedBottom>
        <Caption style={{ textAlign: "center" }}>
          By continuing, you agree to our{" "}
          <Anchor href="/legal/privacy-policy">
            Privacy Policy
          </Anchor>.
        </Caption>
      </FixedBottom>}
    </Container>
  }
}
