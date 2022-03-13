import { functions } from "./utils/firebase";

// Express API
import { main } from "./api";

const REGION = 'europe-west2';

// Main API
export const api = functions.region(REGION).https.onRequest(main);

// Healthcheck endpoint
export const status = functions.region(REGION).https.onRequest((request, response) => {
  console.log("Healthcheck");
  response.send("ok");
});
