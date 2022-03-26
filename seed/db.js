require('dotenv').config()
const admin = require("firebase-admin")
const base64 = require("base-64")

const argv = require('minimist')(process.argv.slice(2));
const isProd = argv.prod

const encodedServiceAccount = isProd ? process.env.SERVICE_ACCOUNT_PROD : process.env.SERVICE_ACCOUNT_DEV
const serviceAccount = JSON.parse(base64.decode(encodedServiceAccount));
const credential = admin.credential.cert(serviceAccount);

admin.initializeApp({ credential });
const db = admin.firestore()

module.exports = db