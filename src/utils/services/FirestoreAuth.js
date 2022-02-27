import { getAuth, signInWithEmailAndPassword, signInAnonymously } from "firebase/auth";


import firebaseApp from "../FirebaseUtils"

export const authenticateWithEmailAndPassword = (auth, email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
};

export const authenticateAnonymously = () => {
    return signInAnonymously(getAuth(firebaseApp));
  };

export const Authentication = () => {
    return getAuth()
}
