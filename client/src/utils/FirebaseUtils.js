import { initializeApp } from "firebase/app"
import { getFirestore, initializeFirestore } from "firebase/firestore"
import { connectFunctionsEmulator, getFunctions } from "firebase/functions"
import { getStorage } from "firebase/storage"
// import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
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
  // window.FIREBASE_APPCHECK_DEBUG_TOKEN = true
  connectFunctionsEmulator(functions, "localhost", 5000)
}

// initializeAppCheck(firebaseApp, {
//   provider: new ReCaptchaV3Provider(
//     process.env.REACT_APP_FIREBASE_RECAPTCHA_PUBLIC_ID
//   ),
//   isTokenAutoRefreshEnabled: true,
// });

export { firebaseApp, db, storage, auth, functions }
