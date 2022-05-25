import { useEffect, useState } from "react";
import * as base64 from "base-64"
import { onAuthStateChanged, sendEmailVerification, sendSignInLinkToEmail, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ButtonTheme, Colors } from "../../components/CircleButton";
import TextField from "../../components/Input";
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

export default function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { search } = useLocation()

  const requiresPassword = location.state?.requiresPassword ?? true
  const requiredEmailDomain = location.state?.requiredEmailDomain

  let emailSuffix = requiredEmailDomain ? `@${requiredEmailDomain}` : ""

  const [searchParams] = useSearchParams()
  const [backPath, successPath] = ["back", "success"].map(e => base64.decode(searchParams.get(e)))
  const successState = JSON.parse(base64.decode(searchParams.get("state")))

  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    return onAuthStateChanged(auth, user => {
      setIsLoading(false)
      setUser(user)
    })
  }, [])

  const handleSignInWithGoogle = () => {
    navigate({ pathname: "google", search })
  }

  const handleTryAnotherWay = () => setError(null)

  const handleSignInWithPassword = async () => {
    setIsLoading(true)

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

  const handleSendEmailLink = () => {
    setIsLoading(true)

    const redirectUrl = new URL(window.location.href)
    redirectUrl.pathname = "/auth/email-link"
    redirectUrl.searchParams.append("first", firstName)
    redirectUrl.searchParams.append("last", lastName)

    sendSignInLinkToEmail(auth, email, {
      url: redirectUrl.href,
      handleCodeInApp: true
    })
      .then(() => {
        localStorage.setItem("emailForSignIn", email)
        setIsLoading(false)
        navigate("email-link-sent")
      })
      .catch(error => {
        const errorCode = error.code;
        const errorMessage = error.message;

        setIsLoading(false)
        setError({
          title: "Something went wrong",
          body: "We're sorry, but we couldn't send you an email link. Try logging in a different way, or checking back later."
        })
      })
  }

  const handleForgotPassword = () => {
    navigate({ pathname: "forgot-password", search })
  }

  const isFormValid = (
    firstName &&
    lastName &&
    validateEmail(email) && (
      !requiresPassword || validatePassword(password)
    )
  )

  const formOnSubmit = requiresPassword ? handleSignInWithPassword : handleSendEmailLink
  const submitTitle = requiresPassword ? "Sign in" : "Send email link"

  console.log(email)

  if (error) {
    <IconActionPage
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
          
          <h3 className="header-s">Name</h3>
          <Spacer y={2} />
          <h4 className="header-xs">First name</h4>
          <Spacer y={1} />
          <TextField
            name="firstName"
            value={firstName}
            onChange={setFirstName}
          />
          <Spacer y={2} />
          <h4 className="header-xs">Last name</h4>
          <Spacer y={1} />
          <TextField
            name="lastName"
            value={lastName}
            onChange={setLastName}
          />

          <Spacer y={4} />

          <h3 className="header-s">Login details</h3>
          <Spacer y={2} />
          <h4 className="header-xs">Email address</h4>
          <Spacer y={1} />
          <TextField
            name="email"
            type="email"
            value={email}
            suffix={emailSuffix}
            onChange={setEmail}
          />
          {
            requiresPassword && <div>
              <Spacer y={2} />
              <h4 className="header-xs">Password</h4>
              <Spacer y={2} />
              <p className="text-body-faded">Your password must be 8 characters or more and include at least one number, lowercase letter and uppercase letter.</p>
              <Spacer y={2} />
              <TextField
                name="password"
                type="password"
                value={password}
                onChange={setPassword}
              />
            </div>
          }

          <Spacer y={2} />

          <MainButton title={submitTitle} onClick={formOnSubmit} disabled={!isFormValid} />

          {
            requiresPassword && <div>
              <Spacer y={2} />
              <MainButton title="Forgot password" onClick={handleForgotPassword} buttonTheme={ButtonTheme.MONOCHROME_OUTLINED} />
            </div>
          }
        </div>
      </div>
    </div>
  }  
}

function SignInWithGoogeButton({ style, ...props }) {
  return <button {...props} style={{ 
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
    Sign in with Google
    
  </button>
}