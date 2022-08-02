import { onAuthStateChanged } from "firebase/auth"
import { serverTimestamp, updateDoc } from "firebase/firestore"
import { useEffect, useState } from "react"
import MainButton from "../../components/MainButton"
import { Modal } from "../../components/Modal"
import Spacer from "../../components/Spacer"
import Collection from "../../enums/Collection"
import { privacyPolicyVersion } from "../../utils/constants"
import { auth } from "../../utils/FirebaseUtils"

function AgreementPopup({ title, path, handleAgree, isLoading }) {
  return <div style={{ position: "fixed", zIndex: 100 }}>
    <Modal>
      <h2 className="header-m">{title}</h2>
      <Spacer y={2} />
      <p className="text-body-faded">
        We've made updates to our{" "}
        <a
          target="_blank"
          rel="noreferrer"
          href={`/legal/${path}`}
        >
          {title}
        </a>.
        Please review and agree to it to continue.
      </p>
      <Spacer y={4} />
      <MainButton
        title="I agree"
        isLoading={isLoading}
        onClick={handleAgree}
      />
    </Modal>
  </div>
}

export default function UpdatedUserAgreementPopup() {
  const [authUser, setAuthUser] = useState(null)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    return onAuthStateChanged(auth, authUser => {
      setAuthUser(authUser)
    })
  }, [])

  useEffect(() => {
    if (!authUser) { return }

    return Collection.USER.onChange(authUser.uid, setUser)
  }, [authUser])

  const handleAgreeToPrivacyPolicy = async () => {
    setIsLoading(true)

    await updateDoc(Collection.USER.docRef(user.id), { 
      privacyPolicy: {
        signedAt: serverTimestamp(),
        version: privacyPolicyVersion
      }
    })

    setIsLoading(false)
  }

  if (user) {
    console.log(user)
    const { privacyPolicy } = user

    if (!privacyPolicy || privacyPolicy.version !== privacyPolicyVersion) {
      console.log("yes")
      return <AgreementPopup 
        title="Privacy Policy"
        path="privacy-policy"
        handleAgree={handleAgreeToPrivacyPolicy}
        isLoading={isLoading}
      />
    } else {
      return null
    }
  } else {
    return null
  }
}