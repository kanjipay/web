import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseApp = initializeApp({
  apiKey: "AIzaSyDOuYMXVQItrr0Czc7KubacaJBTlAXH58I",
  authDomain: "kanjipay.firebaseapp.com",
  projectId: "kanjipay",
  storageBucket: "kanjipay.appspot.com",
  messagingSenderId: "701281117844",
  appId: "1:701281117844:web:50f05cf073b7d546837681",
  measurementId: "G-926D1WML6N",
});
const db = getFirestore();

export default db;
