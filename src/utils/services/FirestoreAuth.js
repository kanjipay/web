import { getAuth, signInWithEmailAndPassword } from "firebase/auth";


export const authenticateWithEmailAndPassword = (auth, email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
};

export const authenticateAnonymously = () => {
    return signInAnonymously(getAuth(app));
  };

export const authentication = getAuth();

