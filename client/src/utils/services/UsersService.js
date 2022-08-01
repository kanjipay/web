import { updateProfile } from "firebase/auth"
import { getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore"
import Collection from "../../enums/Collection"
import { privacyPolicyVersion } from "../constants"
import { auth } from "../FirebaseUtils"

export class MarketingConsent {
  static PENDING = "PENDING"
  static APPROVED = "APPROVED"
  static DECLINED = "DECLINED"
}

export async function processUserCredential(credential) {
  const authUser = credential.user
  const { uid, email, displayName } = authUser

  const userRef = Collection.USER.docRef(uid)
  const userDoc = await getDoc(userRef)

  if (userDoc.exists()) {
    const { firstName, lastName, privacyPolicy } = userDoc.data()

    const update = {}
    const promises = []

    let hasName = false

    if (firstName && lastName) {
      hasName = true

      if (!displayName) {
        const updateAuthUserDisplayName = updateProfile(authUser, { displayName: `${firstName} ${lastName}` })
        promises.push(updateAuthUserDisplayName)
      }
    } else if (displayName && displayName.split(" ").length >= 2) {
      hasName = true

      const [firstNameFromAuthUser, lastNameFromAuthUser] = displayName.split(" ")

      update["firstName"] = firstNameFromAuthUser
      update["lastName"] = lastNameFromAuthUser
    }

    if (!privacyPolicy || privacyPolicy.version !== privacyPolicyVersion) {
      update["privacyPolicy"] = {
        signedAt: serverTimestamp(),
        version: privacyPolicyVersion
      }
    }

    if (Object.keys(update).length > 0) {
      const updateUser = updateDoc(userRef, update)
      promises.push(updateUser)
    }

    if (promises.length > 0) {
      await Promise.all(promises)
    }

    return hasName
  } else {
    const docData = {
      email,
      marketingConsentStatus: MarketingConsent.PENDING,
      createdAt: serverTimestamp(),
      privacyPolicy: {
        signedAt: serverTimestamp(),
        version: privacyPolicyVersion
      }
    }

    const hasName = displayName && displayName.split(" ").length >= 2

    if (hasName) {
      const [firstName, lastName] = displayName.split(" ")

      docData["firstName"] = firstName
      docData["lastName"] = lastName
    }

    await setDoc(userRef, docData)

    return hasName
  }
}

export async function setMarketingConsent(marketingConsentStatus) {
  const acceptableStatuses = [
    MarketingConsent.APPROVED,
    MarketingConsent.DECLINED,
  ]

  if (!acceptableStatuses.includes(marketingConsentStatus)) {
    return false
  }

  const userId = auth.currentUser?.uid

  if (!userId) {
    return false
  }

  await updateDoc(Collection.USER.docRef(userId), {
    marketingConsentStatus,
  })

  return true
}
