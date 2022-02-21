import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
initializeApp({
  apiKey: "AIzaSyD_mPx2fE-VuAtVK01xI4tDGaZTAX7ErvQ",
  authDomain: "mercadopay.firebaseapp.com",
  projectId: "mercadopay",
  storageBucket: "mercadopay.appspot.com",
  messagingSenderId: "318216209877",
  appId: "1:318216209877:web:d974381faf6ce9946be95c",
  measurementId: "G-41M1VDVV2M",
});
const db = getFirestore();

export default  db;
