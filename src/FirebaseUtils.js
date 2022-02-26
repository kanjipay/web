import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check"

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseApp = initializeApp({
  apiKey: "AIzaSyD_mPx2fE-VuAtVK01xI4tDGaZTAX7ErvQ",
  authDomain: "mercadopay.firebaseapp.com",
  projectId: "mercadopay",
  storageBucket: "mercadopay.appspot.com",
  messagingSenderId: "318216209877",
  appId: "1:318216209877:web:d974381faf6ce9946be95c",
  measurementId: "G-41M1VDVV2M",
});

const appCheck = initializeAppCheck(firebaseApp, {
  provider: new ReCaptchaV3Provider('6LfUoJ4eAAAAADZ0Z8TNS1WMtHfJH2JKZnNy03wi'),
  isTokenAutoRefreshEnabled: true
});

const db = getFirestore()
const storage = getStorage()

export { db, storage }
