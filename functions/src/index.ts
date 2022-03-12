import { functions } from "./utils/firebase";

// Express API
import { main } from "./api";

//define google cloud function name
export const webApi = functions.https.onRequest(main);

// check functions working ok
export const status = functions.https.onRequest((request, response) => {
  console.log("Healthcheck");
  response.send("ok");
});
