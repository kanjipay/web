import {
  getRedirectResult,
  GoogleAuthProvider,
  signInWithRedirect,
  OAuthProvider,
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

export class OAuthType {
  static GOOGLE = "GOOGLE"
  static APPLE = "APPLE"
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

      const credential = await getRedirectResult(auth)

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
          default:
            break
        }

        provider.setCustomParameters({ locale: "en" })
        signInWithRedirect(auth, provider)
      }
    }

    handleSuccessfulAuth()
  }, [type, userId])

  useEffect(() => {
    if (hasName && userId) {
      navigate(successPath, { state: successState })
    }
  }, [hasName, userId, navigate, successPath, successState])

  const handleTryAnotherWay = () => {
    navigate({ pathname: "/auth", search })
  }

  const handleNameSubmit = async (data) => {
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
      <div className="container">
        <div className="content">
          <Spacer y={4} />
          <Form
            formGroupData={[
              {
                explanation: "Fill in your name to complete your profile.",
                items: [{ name: "firstName" }, { name: "lastName" }],
              },
            ]}
            onSubmit={handleNameSubmit}
            submitTitle="Submit"
          />
          <Spacer y={6} />
        </div>
      </div>
    )
  } else {
    return <LoadingPage message="Signing you in" />
  }
}
