import * as base64 from "base-64"
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth"
import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import Cross from "../../assets/icons/Cross"
import { Colors } from "../../components/CircleButton"
import Form, { generateValidator } from "../../components/Form"
import IconActionPage from "../../components/IconActionPage"
import { Field } from "../../components/input/IntField"
import LoadingPage from "../../components/LoadingPage"
import Spacer from "../../components/Spacer"
import { auth } from "../../utils/FirebaseUtils"
import { validateEmail } from "../../utils/helpers/validation"
import { processUserCredential } from "../../utils/services/UsersService"

export default function EmailLinkPage() {
  const navigate = useNavigate()

  const [searchParams] = useSearchParams()
  const [backPath, successPath] = ["back", "success"].map(e => base64.decode(searchParams.get(e)))
  const [firstName, lastName] = ["first", "last"].map(e => searchParams.get(e))
  const successState = JSON.parse(base64.decode(searchParams.get("state")))

  const emailFromLocalStorage = localStorage.getItem("emailForSignIn")
  const [emailForSignIn, setEmailForSignIn] = useState(emailFromLocalStorage)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (error) { return }

    if (isSignInWithEmailLink(auth, window.location.href)) {
      if (!emailForSignIn) { return }

      signInWithEmailLink(auth, emailForSignIn, window.location.href)
        .then(credential => {
          localStorage.removeItem("emailForSignIn")

          processUserCredential(credential, firstName, lastName).then(() => {
            navigate(successPath, { state: successState })
          })
        })
        .catch(error => {
          setError({
            title: "Something went wrong",
            body: "We're sorry, but we couldn't log you in. Try checking back later."
          })
        })
    } else {
      setError({
        title: "Invalid link",
        body: "This isn't a valid email sign in link."
      })
    }
  }, [emailForSignIn, navigate, successPath, successState, firstName, lastName, error])

  const handleEmailSubmit = async data => {
    const { email } = data
    setEmailForSignIn(email)
  }

  const handleError = () => {
    navigate(backPath)
  }

  if (error) {
    return <IconActionPage
      Icon={Cross}
      iconBackgroundColor={Colors.RED_LIGHT}
      iconForegroundColor={Colors.RED}
      title={error.title}
      body={error.body}
      primaryActionTitle="Go back"
      primaryAction={handleError}
    />
  } else if (emailForSignIn) {
    return <LoadingPage message="Signing you in..." />
  } else {
    <div className="container">
      <div className="content">
        <Spacer y={4} />
        <Form
          formGroupData={[
            {
              explanation: "It looks like you've switched devices. Please enter your email again for added security.",
              items: [
                {
                  name: "email",
                  validators: [generateValidator(validateEmail, "Invalid email")],
                  input: <Field type="email" placeholder="Email" />
                }
              ]
            }
          ]}
          onSubmit={handleEmailSubmit}
          submitTitle="Submit"
        />
        <Spacer y={6} />
      </div>
    </div>
  }
}