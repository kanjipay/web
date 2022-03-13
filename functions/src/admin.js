import * as admin from "firebase-admin";

const env = process.env.ENVIRONMENT || "DEV";
const serviceAccount = require(`./service-account-${env}.json`);
const credential = admin.credential.cert(serviceAccount);

admin.initializeApp({ credential });

export const db = admin.firestore();
export const auth = admin.auth();
