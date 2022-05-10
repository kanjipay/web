import { getAuth, getRedirectResult, GoogleAuthProvider, signInWithRedirect } from "firebase/auth";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import LoadingPage from "../../../../components/LoadingPage";
import * as base64 from "base-64"
import IconActionPage from "../../../../components/IconActionPage";
import Cross from "../../../../assets/icons/Cross";
import { Colors } from "../../../../components/CircleButton";
import { auth } from "../../../../utils/FirebaseUtils";

export default function SignInWithGooglePage() {
  const navigate = useNavigate()
  const { search } = useLocation()

  const [searchParams] = useSearchParams()
  const successPath = base64.decode(searchParams.get("success"))
  const successState = JSON.parse(base64.decode(searchParams.get("state")))

  const isAuthInProgressKey = "isGoogleAuthInProgress"
  const [error, setError] = useState(null)

  function isAuthInProgress() {
    return localStorage.getItem(isAuthInProgressKey) === "true"
  }

  useEffect(() => {
    if (isAuthInProgress()) {
      getRedirectResult(auth)
        .then(result => {
          if (result) {
            navigate(successPath, { state: successState })
            localStorage.setItem(isAuthInProgressKey, "false")
          } else {
            setError({
              title: "Something went wrong",
              body: "We're sorry, but we couldn't log you in. Try checking back later."
            })
          }
        })
        .catch(error => {
          console.log(error)
          localStorage.setItem(isAuthInProgressKey, "false")
          setError({
            title: "Something went wrong",
            body: "We're sorry, but we couldn't log you in. Try checking back later."
          })
        })
    } else {
      localStorage.setItem(isAuthInProgressKey, "true")
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      signInWithRedirect(auth, provider)
    }
  }, [navigate, successPath, successState])

  const handleTryAnotherWay = () => {
    navigate({ pathname: "/events/auth", search })
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
  } else {
    return <LoadingPage message="Signing you in" />
  }
}