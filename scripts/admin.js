require("dotenv").config();
const base64 = require("base-64");
const admin = require("firebase-admin");

const environment = process.env.ENV

let serviceAccountString

switch (environment) {
  case "STAGING":
    serviceAccountString = process.env.SERVICE_ACCOUNT_STAGING
    break;
  case "DEV":
    serviceAccountString = process.env.SERVICE_ACCOUNT_DEV
    break;
  case "PROD":
    serviceAccountString = process.env.SERVICE_ACCOUNT_PROD
    break;
  default:
    throw new Error("Incorrect environment: " + environment)
}

const serviceAccount = JSON.parse(base64.decode(serviceAccountString));
const credential = admin.credential.cert(serviceAccount);

admin.initializeApp({ credential });
const db = admin.firestore();
const auth = admin.auth()

module.exports = { db, auth }