import { functions } from "./utils/firebase";

// Express API
import { main } from "./api";

// Main API
export const api = functions.https.onRequest(main);

// Healthcheck endpoint
export const status = functions.https.onRequest((request, response) => {
  console.log("Healthcheck");
  response.send("ok");
});
