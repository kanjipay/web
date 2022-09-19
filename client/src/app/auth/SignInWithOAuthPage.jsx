import {
  getRedirectResult,
  GoogleAuthProvider,
  signInWithRedirect,
  OAuthProvider,
  FacebookAuthProvider,
  fetchSignInMethodsForEmail,
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
import { updateDoc } from "firebase/firestore"
import Collection from "../../enums/Collection"
import Spacer from "../../components/Spacer"
import Form from "../../components/Form"
import { Container } from "../brand/FAQsPage"
import Content from "../../components/layout/Content"

export class OAuthType {
  static GOOGLE = "Google"
  static APPLE = "Apple"
  static FACEBOOK = "Facebook"
}

export function providerIdToPathname(providerId) {
  switch (providerId) {
    case GoogleAuthProvider.PROVIDER_ID:
      return "google"
    case FacebookAuthProvider.PROVIDER_ID:
      return "facebook"
    case "apple.com":
      return "apple"
    case "emailLink":
      return "email-link"
    default:
      return ""
  }
}

export default function SignInWithOAuthPage({ type }) {
  const navigate = useNavigate()
  const { search } = useLocation()

  const [searchParams] = useSearchParams()
  const successPath = base64.decode(searchParams.get("success"))
  const successState = JSON.parse(base64.decode(searchParams.get("state")))
  const [error, setError] = useState(null)
  const [userId, setUserId] = useState(null)
  const [hasName, setHasName] = useState(null)

  useEffect(() => {
    AnalyticsManager.main.viewPage("OAuth", { type })
  }, [type])

  useEffect(() => {
    async function handleSuccessfulAuth() {
      if (userId) {
        return
      }

      let credential

      try {
        credential = await getRedirectResult(auth)
      } catch (err) {
        const matchedEmail = err.customData.email

        if (err.code !== "auth/account-exists-with-different-credential" || !matchedEmail) {
          throw err;
        }

        let methods = await fetchSignInMethodsForEmail(auth, matchedEmail)
        let oldProvider = providerIdToPathname(methods[0])

        const erroredCredential = OAuthProvider.credentialFromError(err) ?? FacebookAuthProvider.credentialFromError(err) ?? GoogleAuthProvider.credentialFromError(err)

        if (!!erroredCredential) {
          localStorage.setItem("credentialToLink", JSON.stringify(erroredCredential.toJSON()))

          if (oldProvider === "email-link") {
            navigate({ pathname: "/auth", search }, { state: { emailForLink: matchedEmail } })
          } else {
            navigate({ pathname: `/auth/${oldProvider}`, search })
          }
          
          return
        }
      }

      if (credential) {
        setUserId(credential.user.uid)
        const hasName = await processUserCredential(credential)
        setHasName(hasName)
      } else {
        let provider

        switch (type) {
          case OAuthType.APPLE:
            provider = new OAuthProvider("apple.com")
            provider.addScope("email")
            provider.addScope("name")
            break
          case OAuthType.GOOGLE:
            provider = new GoogleAuthProvider()
            provider.addScope("email")
            break
          case OAuthType.FACEBOOK:
            provider = new FacebookAuthProvider()
            provider.addScope("email")
            break
          default:
            break
        }

        signInWithRedirect(auth, provider)
      }
    }

    handleSuccessfulAuth()
  }, [type, userId, navigate, search])

  useEffect(() => {
    if (hasName && userId) {
      AnalyticsManager.main.logEvent("Authenticate", { type })
      localStorage.setItem("lastAuthType", type)
      navigate(successPath, { state: successState })
    }
  }, [hasName, userId, navigate, successPath, successState, type])

  const handleTryAnotherWay = () => {
    navigate({ pathname: "/auth", search })
  }

  const handleNameSubmit = async (data) => {
    AnalyticsManager.main.pressButton("ProvideNameAfterAuth")
    
    const { firstName, lastName } = data

    await updateDoc(Collection.USER.docRef(userId), {
      firstName,
      lastName,
    })

    navigate(successPath, { state: successState })
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
  } else if (hasName === false) {
    return (
      <Container>
        <Content paddingTop={32}>
          <Form
            formGroupData={[
              {
                explanation: "Fill in your name to complete your profile.",
                items: [
                  { name: "firstName" },
                  { name: "lastName" }
                ],
              },
            ]}
            onSubmit={handleNameSubmit}
            submitTitle="Submit"
          />
          <Spacer y={6} />
        </Content>
      </Container>
    )
  } else {
    return <LoadingPage message="Signing you in" />
  }
}
