import * as admin from "firebase-admin";
import * as base64 from "base-64";

let dbInstance: admin.firestore.Firestore | null = null;
let authInstance: admin.auth.Auth | null = null;

function getAdmin() {
  const serviceAccount = JSON.parse(base64.decode(process.env.SERVICE_ACCOUNT));
  const credential = admin.credential.cert(serviceAccount);

  admin.initializeApp({ credential });

  dbInstance = admin.firestore();
  dbInstance.settings({ ignoreUndefinedProperties: true })
  authInstance = admin.auth();

  return { db: dbInstance, auth: authInstance };
}

export const db = () => dbInstance || getAdmin().db;
export const auth = () => authInstance || getAdmin().auth;