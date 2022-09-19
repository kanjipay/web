import * as base64 from "base-64"
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth"
import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import Cross from "../../assets/icons/Cross"
import { Colors } from "../../enums/Colors"
import Form, { generateValidator } from "../../components/Form"
import IconActionPage from "../../components/IconActionPage"
import { Field } from "../../components/input/IntField"
import LoadingPage from "../../components/LoadingPage"
import { auth } from "../../utils/FirebaseUtils"
import { validateEmail } from "../../utils/helpers/validation"
import { restoreState } from "../../utils/services/StateService"
import { processUserCredential } from "../../utils/services/UsersService"
import { updateDoc } from "firebase/firestore"
import Collection from "../../enums/Collection"
import { AnalyticsManager } from "../../utils/AnalyticsManager"
import { AuthType } from "./Auth"
import { Container } from "../brand/FAQsPage"
import Content from "../../components/layout/Content"

export default function EmailLinkPage() {
  const navigate = useNavigate()

  const [searchParams] = useSearchParams()
  const [backPath, successPath] = ["back", "success"].map((e) =>
    base64.decode(searchParams.get(e))
  )

  const stateId = searchParams.get("stateId")

  let successState

  try {
    successState = JSON.parse(base64.decode(searchParams.get("state")))
  } catch (err) {
    successState = {}
  }

  const emailFromLocalStorage = localStorage.getItem("emailForSignIn")
  const [emailForSignIn, setEmailForSignIn] = useState(emailFromLocalStorage)
  const [error, setError] = useState(null)
  const [userId, setUserId] = useState(null)
  const [hasName, setHasName] = useState(null)

  useEffect(() => {
    restoreState(stateId).then(() => {
      AnalyticsManager.main.viewPage("EmailLink")
    })
    .catch(err => {
      console.error(err)
    })
  }, [stateId])

  useEffect(() => {
    async function handleEmailLink() {
      try {
        const currentUrl = window.location.href

        if (!emailForSignIn || error || userId) {
          return
        }

        if (!isSignInWithEmailLink(auth, currentUrl)) {
          setError({
            title: "Invalid link",
            body: "This isn't a valid email sign in link.",
          })

          return
        }

        const credential = await signInWithEmailLink(
          auth,
          emailForSignIn,
          currentUrl
        )

        setUserId(credential.user.uid)

        localStorage.removeItem("emailForSignIn")

        const hasName = await processUserCredential(credential)

        setHasName(hasName)
      } catch (err) {
        console.error(err)

        setError({
          title: "Something went wrong",
          body: "We're sorry, but we couldn't log you in. Try checking back later.",
        })
      }
    }

    handleEmailLink()
  }, [
    emailForSignIn,
    navigate,
    successPath,
    successState,
    error,
    stateId,
    userId,
  ])

  useEffect(() => {
    if (hasName && userId) {
      AnalyticsManager.main.logEvent("Authenticate", { type: AuthType.EMAIL })
      localStorage.setItem("lastAuthType", AuthType.EMAIL)
      navigate(successPath, { state: successState })
    }
  }, [hasName, userId, successPath, successState, navigate])

  const handleEmailSubmit = async (data) => {
    const { email } = data
    AnalyticsManager.main.pressButton("ConfirmEmailOnAuth")
    setEmailForSignIn(email)
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

  const handleError = () => {
    navigate(backPath)
  }

  if (error) {
    return (
      <IconActionPage
        Icon={Cross}
        iconBackgroundColor={Colors.RED_LIGHT}
        iconForegroundColor={Colors.RED}
        title={error.title}
        body={error.body}
        primaryActionTitle="Go back"
        primaryAction={handleError}
      />
    )
  } else if (hasName === false || !emailForSignIn) {
    return <Container>
      <Content paddingTop={32}>
        {
          hasName === false ?
            <Form
              formGroupData={[
                {
                  explanation: "Fill in your name to complete your profile.",
                  items: [
                    { 
                      name: "firstName",
                      input: <Field autocomplete="given-name" />
                    },
                    { 
                      name: "lastName",
                      input: <Field autocomplete="family-name" />
                    }
                  ],
                },
              ]}
              onSubmit={handleNameSubmit}
              submitTitle="Submit"
            /> :
            <Form
              formGroupData={[
                {
                  explanation:
                    "It looks like you've switched browsers. Please enter your email again for added security.",
                  items: [
                    {
                      name: "email",
                      validators: [
                        generateValidator(validateEmail, "Invalid email"),
                      ],
                      input: <Field type="email" placeholder="Email" autocomplete="email" />,
                    },
                  ],
                },
              ]}
              onSubmit={handleEmailSubmit}
              submitTitle="Submit"
            />
        }
      </Content>
    </Container>
  } else {
    return <LoadingPage message="Signing you in..." />
  }
}
