import { updateProfile } from "firebase/auth"
import { getDoc, setDoc, updateDoc } from "firebase/firestore"
import Collection from "../../enums/Collection"
import { auth } from "../FirebaseUtils"

export class MarketingConsent {
  static PENDING = "PENDING"
  static APPROVED = "APPROVED"
  static DECLINED = "DECLINED"
}

export async function processUserCredential(credential, firstName, lastName) {
  const user = credential.user
  const { uid, email, displayName } = user

  const ref = Collection.USER.docRef(uid)

  const promises = [getDoc(ref)]

  if (!displayName) {
    promises.push(
      updateProfile(user, { displayName: `${firstName} ${lastName}` })
    )
  }

  const [doc] = await Promise.all(promises)

  if (!doc.exists()) {
    await setDoc(ref, {
      firstName,
      lastName,
      email,
      marketingConsentStatus: MarketingConsent.PENDING,
    })
  }

  return
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
