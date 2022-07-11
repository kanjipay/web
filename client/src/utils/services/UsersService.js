import { updateProfile } from "firebase/auth"
import { getDoc, setDoc, updateDoc } from "firebase/firestore"
import Collection from "../../enums/Collection"
import { auth } from "../FirebaseUtils"

export class MarketingConsent {
  static PENDING = "PENDING"
  static APPROVED = "APPROVED"
  static DECLINED = "DECLINED"
}

export async function processUserCredential(credential) {
  const user = credential.user
  const { uid, email, displayName } = user

  const userRef = Collection.USER.docRef(uid)

  const userDoc = await getDoc(userRef)

  async function updateDocWithDisplayName() {
    if (displayName && displayName.split(" ").length >= 2) {
      const [firstName, lastName] = displayName.split(" ")

      await updateDoc(userRef, { firstName, lastName })

      return true
    } else {
      return false
    }
  }

  if (userDoc.exists()) {
    const { firstName, lastName } = userDoc.data()

    if (!firstName || !lastName) {
      return await updateDocWithDisplayName()
    } else {
      if (!displayName) {
        await updateProfile(user, { displayName: `${firstName} ${lastName}`})
      }

      return true
    }
  } else {
    await setDoc(userRef, {
      email,
      marketingConsentStatus: MarketingConsent.PENDING
    })

    return await updateDocWithDisplayName()
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
