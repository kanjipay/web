import { useEffect, useState } from "react"
import LoadingPage from "../../components/LoadingPage"
import { AnalyticsManager } from "../../utils/AnalyticsManager"
import { OAuthProvider, signInWithPopup } from "firebase/auth"
import { auth } from "../../utils/FirebaseUtils"
import { processUserCredential } from "../../utils/services/UsersService"
import * as base64 from "base-64"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { updateDoc } from "firebase/firestore"
import Collection from "../../enums/Collection"
import Spacer from "../../components/Spacer"
import Form from "../../components/Form"
import IconActionPage from "../../components/IconActionPage"
import Cross from "../../assets/icons/Cross"
import { Colors } from "../../enums/Colors"

export default function SignInWithApplePage() {
  const [userId, setUserId] = useState(null)
  const [hasName, setHasName] = useState(null)
  const [error, setError] = useState(null)

  const navigate = useNavigate()
  const { search } = useLocation()

  const [searchParams] = useSearchParams()
  const successPath = base64.decode(searchParams.get("success"))
  const successState = JSON.parse(base64.decode(searchParams.get("state")))

  useEffect(() => {
    AnalyticsManager.main.viewPage("AppleAuth")
  }, [])

  useEffect(() => {
    async function handleAuth() {
      if (error) {
        return
      }

      const appleProvider = new OAuthProvider("apple.com")
      appleProvider.addScope("email")
      appleProvider.addScope("name")
      appleProvider.setCustomParameters({ locale: "en" })

      try {
        const credential = await signInWithPopup(auth, appleProvider)

        if (credential) {
          setUserId(credential.user.uid)
          const hasName = await processUserCredential(credential)
          setHasName(hasName)
        }
      } catch (err) {
        console.log(err)
        setError({
          title: "Something went wrong",
          body: "We're sorry, but we couldn't log you in. Try checking back later.",
        })
      }
    }

    handleAuth()
  }, [error])

  useEffect(() => {
    if (hasName && userId) {
      navigate(successPath, { state: successState })
    }
  }, [navigate, successPath, successState, hasName, userId])

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
