import { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Colors } from "../../../../components/CircleButton";
import Input from "../../../../components/Input";
import MainButton from "../../../../components/MainButton";
import NavBar from "../../../../components/NavBar";
import OrDivider from "../../../../components/OrDivider";
import Spacer from "../../../../components/Spacer";
import { validateEmail } from "../../../../utils/helpers/validation";
import { getAuth, sendSignInLinkToEmail } from "firebase/auth";
import LoadingPage from "../../../../components/LoadingPage"
import * as base64 from "base-64"
import IconActionPage from "../../../../components/IconActionPage";
import Cross from "../../../../assets/icons/Cross";
import { auth } from "../../../../utils/FirebaseUtils";

export default function AuthPage() {
  const navigate = useNavigate()
  const { search } = useLocation()

  const [searchParams] = useSearchParams()

  let backPath = null

  const codedBackPath = searchParams.get("back")

  if (codedBackPath) {
    backPath = base64.decode(codedBackPath)
  }

  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSignInWithGoogle = () => {
    navigate({ pathname: "google", search })
  }

  const handleTryAnotherWay = () => setError(null)

  const handleSendEmailLink = () => {
    setIsLoading(true)

    const emailLinkUrl = new URL(window.location.href)
    emailLinkUrl.pathname += "/email-link"

    sendSignInLinkToEmail(auth, email, {
      url: emailLinkUrl.href,
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
        console.log(errorMessage)
        console.log(errorCode)

        setIsLoading(false)
        setError({
          title: "Something went wrong",
          body: "We're sorry, but we couldn't send you an email link. Try logging in a different way, or checking back later."
        })
      })
  }

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

        <SignInWithGoogeButton onClick={handleSignInWithGoogle} />

        <Spacer y={4} />

        <OrDivider />

        <Spacer y={4} />

        <h3 className="header-s">Name</h3>
        <Spacer y={2} />
        <p className="text-body">First name</p>
        <Spacer y={1} />
        <Input
          placeholder="First name"
          name="firstName"
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
        />
        <Spacer y={2} />
        <p className="text-body">Last name</p>
        <Spacer y={1} />
        <Input
          placeholder="Last name"
          name="lastName"
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
        />

        <Spacer y={4} />

        <h3 className="header-s">Email address</h3>
        <Spacer y={2} />
        <p className="text-body-faded">Please specify the email address you’d like us to send the tickets to.</p>
        <Spacer y={2} />
        <Input
          placeholder="Email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Spacer y={2} />
        <MainButton title="Send email link" onClick={handleSendEmailLink} disabled={!(email && validateEmail(email) && firstName && lastName)} />
      </div>
    </div>
  }  
}

function SignInWithGoogeButton({ style, ...props }) {
  return <button {...props} style={{ 
    height: 48, 
    borderWidth: 2,
    borderColor: Colors.OFF_WHITE,
    borderRadius: 16,
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