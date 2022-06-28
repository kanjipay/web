import { useEffect, useState } from "react";
import * as base64 from "base-64"
import { onAuthStateChanged, sendEmailVerification, sendSignInLinkToEmail, signInWithEmailAndPassword } from "firebase/auth";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Colors } from "../../enums/Colors";
import { ButtonTheme } from "../../components/ButtonTheme";
import MainButton from "../../components/MainButton";
import NavBar from "../../components/NavBar";
import OrDivider from "../../components/OrDivider";
import Spacer from "../../components/Spacer";
import { validateEmail, validatePassword } from "../../utils/helpers/validation";
import LoadingPage from "../../components/LoadingPage"
import IconActionPage from "../../components/IconActionPage";
import Cross from "../../assets/icons/Cross";
import { auth } from "../../utils/FirebaseUtils";
import { processUserCredential } from "../../utils/services/UsersService";
import Form, { generateValidator } from "../../components/Form";
import { Field, FieldDecorator } from "../../components/input/IntField";
import { AnalyticsManager } from "../../utils/AnalyticsManager";
import { saveState } from "../../utils/services/StateService";
import Revealer from "../../components/Revealer";

export default function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { search } = useLocation()

  const requiresPassword = location.state?.requiresPassword ?? false
  const requiredEmailDomain = location.state?.requiredEmailDomain

  let emailSuffix = requiredEmailDomain ? `@${requiredEmailDomain}` : ""

  const [searchParams] = useSearchParams()
  const [backPath, successPath] = ["back", "success"].map(e => base64.decode(searchParams.get(e)))
  const successState = JSON.parse(base64.decode(searchParams.get("state")))

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    AnalyticsManager.main.viewPage("Auth")
  }, [])

  useEffect(() => {
    return onAuthStateChanged(auth, user => {
      setIsLoading(false)
      setUser(user)
    })
  }, [])

  const handleSignInWithGoogle = () => {
    console.log("handleSignInWithGoogle")
    navigate({ pathname: "google", search })
  }

  const handleTryAnotherWay = () => setError(null)

  const handleSignInWithPassword = async (data) => {
    const { firstName, lastName, email, password } = data

    const redirectUrl = new URL(window.location.href)
    redirectUrl.pathname = "/auth/redirect"

    const credential = await signInWithEmailAndPassword(auth, email, password)
    const user = credential.user

    const promises = [processUserCredential(credential, firstName, lastName)]

    if (!user.emailVerified) {
      promises.push(
        sendEmailVerification(user, {
          url: redirectUrl.href,
          handleCodeInApp: true
        })
      )
    }

    await Promise.all(promises)

    setIsLoading(false)

    user.emailVerified ?
      navigate(successPath, { state: successState }) :
      navigate("email-verification-sent")
  }

  const handleSendEmailLink = async (data) => {
    const { firstName, lastName, email } = data

    const stateId = await saveState()

    const redirectUrl = new URL(window.location.href)
    redirectUrl.pathname = "/auth/email-link"
    redirectUrl.searchParams.append("first", firstName)
    redirectUrl.searchParams.append("last", lastName)
    redirectUrl.searchParams.append("stateId", stateId)

    sendSignInLinkToEmail(auth, email, {
      url: redirectUrl.href,
      handleCodeInApp: true
    })
      .then(() => {
        localStorage.setItem("emailForSignIn", email)
        navigate("email-link-sent")
      })
      .catch(error => {
        const errorCode = error.code;
        const errorMessage = error.message;

        setError({
          title: "Something went wrong",
          body: "We're sorry, but we couldn't send you an email link. Try logging in a different way, or checking back later."
        })
      })
  }

  const handleForgotPassword = () => {
    navigate({ pathname: "forgot-password", search })
  }

  const onSubmit = requiresPassword ? handleSignInWithPassword : handleSendEmailLink
  const submitTitle = requiresPassword ? "Sign in" : "Send email link"

  if (error) {
    return <IconActionPage
      Icon={Cross}
      iconBackgroundColor={Colors.RED_LIGHT}
      iconForegroundColor={Colors.RED}
      title={error.title}
      body={error.body}
      primaryActionTitle="Try another way"
      primaryAction={handleTryAnotherWay}
    />
  } else if (isLoading) {
    return <LoadingPage />
  } else {
    const formFields = [
      { name: "firstName" },
      { name: "lastName" },
      {
        name: "email",
        validators: [generateValidator(validateEmail, "Invalid email")],
        decorator: <FieldDecorator suffix={emailSuffix} />,
        input: <Field type="email" />
      },
    ]

    if (requiresPassword) {
      formFields.push({
        name: "password",
        validators: [generateValidator(validatePassword, "Your password must be 8 characters or more and include an uppercase letter, lowercase letter and number.")],
        explanation: "Your password must be 8 characters or more and include an uppercase letter, lowercase letter and number.",
        input: <Field type="password" />
      })
    }
    
    return <div className="container">
      <NavBar
        title="Sign in"
        backPath={backPath}
      />

      <div className="content">
        <Spacer y={9} />

        <div>
          {
            !requiredEmailDomain && <div>
              <SignInWithGoogeButton onClick={handleSignInWithGoogle} />
              <Spacer y={4} />
              <OrDivider />
              <Spacer y={4} />
            </div>
          }

          <Revealer 
            title="Email me a sign in link"
            name="auth"
          >
            <Form
              formGroupData={[
                {
                  items: formFields
                }
              ]}
              onSubmit={onSubmit}
              submitTitle={submitTitle}
            />

            {
              requiresPassword && <div>
                <Spacer y={2} />
                <MainButton title="Forgot password" onClick={handleForgotPassword} buttonTheme={ButtonTheme.MONOCHROME_OUTLINED} />
              </div>
            }
          </Revealer>

          
          <Spacer y={6} />
        </div>
      </div>
    </div>
  }  
}

function SignInWithGoogeButton({ style, ...props }) {
  return <button {...props} test-id="google-auth-button" style={{ 
    height: 48, 
    borderWidth: 2,
    borderColor: Colors.OFF_WHITE,
    width: "100%",
    borderStyle: "solid",
    backgroundColor: Colors.WHITE,
    display: "flex",
    outline: "none",
    alignItems: "center",
    justifyContent: "center",
    color: Colors.GRAY_LIGHT,
    cursor: "pointer",
    columnGap: 8,
    ...style
  }}>
    <img
      src="/img/google.png"
      alt=""
      style={{ height: 20, width: 20 }}
    />
    Continue with Google
    
  </button>
}