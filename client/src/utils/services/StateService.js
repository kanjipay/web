import { addDoc, deleteDoc, getDoc } from "firebase/firestore"
import Collection from "../../enums/Collection"
import { LocalStorageKeys } from "../IdentityManager"

export async function saveState(additionalData = {}) {
  const localStorageKeys = [
    LocalStorageKeys.MONEYHUB_BANK_ID,
    LocalStorageKeys.CREZCO_BANK_CODE,
    LocalStorageKeys.PSEUDO_USER_ID,
    LocalStorageKeys.ATTRIBUTION_ITEMS
  ]

  const localStorageData = localStorageKeys.reduce((currState, key) => {
    currState[key] = localStorage.getItem(key)
    return currState
  }, {})

  const stateDoc = await addDoc(Collection.STATE.ref, { localStorageData, additionalData })


  console.log("saved state id: ", stateDoc.id)
  const stateId = stateDoc.id

  return stateId
}

export async function restoreState(stateId, shouldDelete = true) {
  try {
    console.log("restoring state with id ", stateId)
    const docRef = Collection.STATE.docRef(stateId)
    const stateDoc = await getDoc(docRef)

    if (!stateDoc.exists()) { return null }

    const { localStorageData } = stateDoc.data()

    for (const [key, value] of Object.entries(localStorageData)) {
      localStorage.setItem(key, value)
    }

    if (shouldDelete) {
      await deleteDoc(docRef)
    }

    return localStorageData
  } catch (err) {
    console.log(err)
  }
  
}