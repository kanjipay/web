import { initializeApp } from "firebase/app"
import { initializeFirestore } from "firebase/firestore"
import { connectFunctionsEmulator, getFunctions } from "firebase/functions"
import { getStorage } from "firebase/storage"
import Environment from "../enums/Environment"
import { getAuth } from "firebase/auth"

const firebaseApp = initializeApp(
  JSON.parse(process.env.REACT_APP_FIREBASE_OPTIONS)
)

const db = initializeFirestore(firebaseApp, { ignoreUndefinedProperties: true })
const storage = getStorage()
const auth = getAuth()
const functions = getFunctions(firebaseApp)

if (process.env.REACT_APP_ENV_NAME === Environment.DEV_LOCAL) {
  connectFunctionsEmulator(functions, "localhost", 5000)
}

export { firebaseApp, db, storage, auth, functions }
