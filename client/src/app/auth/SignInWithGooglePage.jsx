import {
  getRedirectResult,
  GoogleAuthProvider,
  signInWithRedirect,
} from "firebase/auth"
import { useEffect, useState } from "react"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import LoadingPage from "../../components/LoadingPage"
import * as base64 from "base-64"
import IconActionPage from "../../components/IconActionPage"
import Cross from "../../assets/icons/Cross"
import { Colors } from "../../enums/Colors"
import { auth } from "../../utils/FirebaseUtils"
import { processUserCredential } from "../../utils/services/UsersService"
import { AnalyticsManager } from "../../utils/AnalyticsManager"

export default function SignInWithGooglePage() {
  useEffect(() => {})
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
    AnalyticsManager.main.viewPage("GoogleAuth", {
      isAuthInProgress: isAuthInProgress(),
    })
  })

  useEffect(() => {
    if (error) { return }
    console.log("google page useEffect. isAuthInProgess: ", isAuthInProgress())
    if (isAuthInProgress()) {
      getRedirectResult(auth)
        .then((credential) => {
          if (credential) {
            const displayName = credential?.user?.displayName

            let firstName = ""
            let lastName = ""

            if (displayName) {
              const names = displayName.split(" ")

              if (names.length >= 2) {
                ;[firstName, lastName] = names
              } else {
                firstName = displayName ?? ""
              }
            }

            processUserCredential(credential, firstName, lastName).then(() => {
              navigate(successPath, { state: successState })
              localStorage.setItem(isAuthInProgressKey, "false")
            })
          } else {
            localStorage.setItem(isAuthInProgressKey, "false")

            setError({
              title: "Something went wrong",
              body: "We're sorry, but we couldn't log you in. Try checking back later.",
            })
          }
        })
        .catch((error) => {
          console.log(error)
          localStorage.setItem(isAuthInProgressKey, "false")
          setError({
            title: "Something went wrong",
            body: "We're sorry, but we couldn't log you in. Try checking back later.",
          })
        })
    } else {
      localStorage.setItem(isAuthInProgressKey, "true")
      const provider = new GoogleAuthProvider()
      provider.addScope("email")
      signInWithRedirect(auth, provider)
    }
  }, [navigate, successPath, successState, error])

  const handleTryAnotherWay = () => {
    navigate({ pathname: "/auth", search })
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
  } else {
    return <LoadingPage message="Signing you in" />
  }
}
