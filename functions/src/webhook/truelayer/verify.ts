import * as tlSigning from "truelayer-signing";
import { truelayerUrlName } from "../../utils/truelayerClient";
import axios from "axios";

let cacheDate: Date | null;
let cachedJwks: string | null;

function parseRawHeaders(arr: string[], loggingClient) {
  loggingClient.log("Parsing headers for Truelayer Webhook Request");

  // functions.logger.log("Parsing headers for Truelayer Webhook Request", {
  //   correlationId: correlationId,
  // });

  const len = arr.length;
  if (len % 2 !== 0) {
    loggingClient.log("Header has odd number of elements", {header: arr});
    // functions.logger.error("Header has odd number of elements", {
    //   correlationId: correlationId,
    //   header: arr,
    // });
    throw new Error("Headers array cannot have an odd number of elements");
  }

  let i = 0;

  const headers = {};

  while (i < len) {
    if (i % 2 !== 0) {
      const key = arr[i - 1];
      const value = arr[i];

      headers[key] = value;
    }

    i++;
  }

  return headers;
}

export const verify = async (req, loggingClient) => {
  const headers = parseRawHeaders(req.rawHeaders, loggingClient);
  const tlSignature = headers["Tl-Signature"];

  if (!tlSignature) {
    loggingClient.error("Truelayer Signature Missing");

    // functions.logger.error("Truelayer Signature Missing", {
    //   correlationId: correlationId,
    // });
    return false;
  }

  const jku = tlSigning.extractJku(tlSignature);

  if (jku !== `https://webhooks.${truelayerUrlName()}.com/.well-known/jwks`) {
    loggingClient.error("JKU does not match expected version",
      {headerJKU: jku,
      expectedJKU: `https://webhooks.${truelayerUrlName()}.com/.well-known/jwks`,
      });


    // functions.logger.error("JKU does not match expected version", {
    //   correlationId: correlationId,
    //   headerJKU: jku,
    //   expectedJKU: `https://webhooks.${truelayerUrlName()}.com/.well-known/jwks`,
    // });
    return false;
  }

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  let jwks: string;

  if (cachedJwks && cacheDate && cacheDate > oneDayAgo) {
    loggingClient.log("Cached jwks found");
    jwks = cachedJwks;
  } else {
    // functions.logger.log("No cached jwks, retrieving from url", {
    //   correlationId: correlationId,
    // });
    loggingClient.log("No cached jwks, retrieving from url");
    const res = await axios.get(jku);
    jwks = JSON.stringify(res.data);
  }

  const body = JSON.stringify(req.body);

  try {
    tlSigning.verify({
      jwks,
      signature: tlSignature,
      method: tlSigning.HttpMethod.Post,
      path: "/webhook/truelayer",
      body,
      headers,
    });

    
    loggingClient.log("Truelayer verification sucessful");
    return true;
  } catch (err) {

    loggingClient.error("Failed to verify Truelayer signature",
      {error:err}
    );
    return false;
  }
};
