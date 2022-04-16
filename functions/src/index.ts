import * as functions from "firebase-functions";
import internalApp from "./internal/internalApp";
import clientApiApp from "./client/api/clientApiApp";
import onlineMenuApp from "./onlineMenu/onlineMenuApp";

const REGION = "europe-west2";

export const internal = functions
  .region(REGION)
  .runWith({ secrets: [
    "SERVICE_ACCOUNT",
    "MONEYHUB_CLIENT_ID",
    "MONEYHUB_CLIENT_SECRET",
    "MONEYHUB_PRIVATE_JWKS",
    "SENDGRID_API_KEY",
  ] })
  .https.onRequest(internalApp);

export const clientApi = functions
  .region(REGION)
  .runWith({ secrets: [
    "SERVICE_ACCOUNT"
  ] })
  .https.onRequest(clientApiApp);

export const onlineMenu = functions
  .region(REGION)
  .runWith({ secrets: [
    "SERVICE_ACCOUNT"
  ] })
  .https.onRequest(onlineMenuApp);
