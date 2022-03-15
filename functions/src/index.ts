import * as functions from "firebase-functions";
import apiApp from "./api/api";
import webhookApp from "./webhook/webhook";

const REGION = "europe-west2";

const secrets = [
  "SERVICE_ACCOUNT",
  "PLAID_CLIENT_ID",
  "PLAID_CLIENT_SECRET",
  "SENDGRID_API_KEY",
];

export const api = functions
  .region(REGION)
  .runWith({ secrets })
  .https.onRequest(apiApp);

export const webhook = functions
  .region(REGION)
  .runWith({ secrets })
  .https.onRequest(webhookApp);

export const status = functions.region(REGION).https.onRequest((req, res) => {
  console.log("Healthcheck");
  res.sendStatus(200);
});
