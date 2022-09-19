import { addDoc, deleteDoc, getDoc } from "firebase/firestore"
import Collection from "../../enums/Collection"
import { AnalyticsManager } from "../AnalyticsManager"
import { IdentityManager, LocalStorageKeys } from "../IdentityManager"

export async function saveState(additionalData = {}) {
  const localStorageKeys = [
    LocalStorageKeys.CREZCO_BANK_CODE,
    LocalStorageKeys.PSEUDO_USER_ID,
    LocalStorageKeys.ATTRIBUTION_ITEMS,
  ]

  const localStorageData = localStorageKeys.reduce((currState, key) => {
    currState[key] = localStorage.getItem(key)
    return currState
  }, {})

  const stateDoc = await addDoc(Collection.STATE.ref, {
    localStorageData,
    additionalData,
  })

  console.log("saved state id: ", stateDoc.id)
  const stateId = stateDoc.id

  return stateId
}

export async function restoreState(stateId, shouldDelete = true) {
  try {
    const docRef = Collection.STATE.docRef(stateId)
    const stateDoc = await getDoc(docRef)

    if (!stateDoc.exists()) {
      return null
    }

    const { localStorageData } = stateDoc.data()

    for (const [key, value] of Object.entries(localStorageData)) {
      localStorage.setItem(key, value)
    }

    if (shouldDelete) {
      await deleteDoc(docRef)
    }

    const newPseudoUserId = localStorage.getItem(LocalStorageKeys.PSEUDO_USER_ID)

    if (newPseudoUserId) {
      IdentityManager.main.setPseudoUserId(newPseudoUserId)
      AnalyticsManager.main.setUserId(newPseudoUserId)
    }

    return localStorageData
  } catch (err) {
    console.log(err)
  }
}
