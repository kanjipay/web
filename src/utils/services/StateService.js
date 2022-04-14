import { addDoc, deleteDoc, getDoc } from "firebase/firestore"
import Collection from "../../enums/Collection"
import { LocalStorageKeys } from "../IdentityManager"

export async function saveState() {
  console.log("saving state")
  const keys = [
    LocalStorageKeys.BASKET,
    LocalStorageKeys.BASKET_MERCHANT,
    LocalStorageKeys.MONEYHUB_BANK_ID,
    LocalStorageKeys.PSEUDO_USER_ID
  ]

  const state = keys.reduce((currState, key) => {
    currState[key] = localStorage.getItem(key)
    return currState
  }, {})

  const stateDoc = await addDoc(Collection.STATE.ref, { state })
  const stateId = stateDoc.id

  console.log("stateId: ", stateId)

  return stateId
}

export async function restoreState(stateId) {
  try {
    console.log("restoring state with id ", stateId)
    const docRef = Collection.STATE.docRef(stateId)
    const stateDoc = await getDoc(docRef)

    if (!stateDoc.exists()) { return false }

    const { state } = stateDoc.data()

    console.log("restoredState: ", JSON.stringify(state))

    for (const [key, value] of Object.entries(state)) {
      localStorage.setItem(key, value)
    }

    await deleteDoc(docRef)

    return true
  } catch (err) {
    console.log(err)
  }
  
}