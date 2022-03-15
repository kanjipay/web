import * as admin from "firebase-admin";
import * as base64 from "base-64";

const serviceAccount = JSON.parse(base64.decode(process.env.SERVICE_ACCOUNT));
const credential = admin.credential.cert(serviceAccount);

admin.initializeApp({ credential });

export const db = admin.firestore();
export const auth = admin.auth();
