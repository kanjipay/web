import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import Environment from "../enums/Environment";
// import { getPerformance } from "firebase/performance";
// import { getAnalytics } from "firebase/analytics";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseApp = initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
});

// getPerformance(firebaseApp)
// const analytics = getAnalytics()

const db = getFirestore();
const storage = getStorage();
const functions = getFunctions(firebaseApp);

const environment = process.env.REACT_APP_ENV_NAME;

if (environment === Environment.DEV) {
  // window.FIREBASE_APPCHECK_DEBUG_TOKEN = true
  connectFunctionsEmulator(functions, "localhost", 5000);
}

// initializeAppCheck(firebaseApp, {
//   provider: new ReCaptchaV3Provider(
//     process.env.REACT_APP_FIREBASE_RECAPTCHA_PUBLIC_ID
//   ),
//   isTokenAutoRefreshEnabled: true,
// });

export { firebaseApp, db, storage, functions };
