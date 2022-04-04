import * as tlSigning from "truelayer-signing";
import { truelayerUrlName } from "../../utils/truelayerClient";
import axios from "axios";
import * as functions from "firebase-functions";

let cacheDate: Date | null;
let cachedJwks: string | null;

function parseRawHeaders(arr: string[], correlationId: string[]) {
  functions.logger.log("Parsing headers for Truelayer Webhook Request", {
    correlationId: correlationId,
  });

  const len = arr.length;
  if (len % 2 !== 0) {
    functions.logger.error("Header has odd number of elements", {
      correlationId: correlationId,
      header: arr,
    });
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

export const verify = async (req, correlationId) => {
  const headers = parseRawHeaders(req.rawHeaders, correlationId);
  functions.logger.log("Truelayer Webhook Request Headers", {
    correlationId: correlationId,
    headers: headers,
  });
  const tlSignature = headers["Tl-Signature"];

  if (!tlSignature) {
    functions.logger.error("Truelayer Signature Missing", {
      correlationId: correlationId,
    });
    return false;
  }

  const jku = tlSigning.extractJku(tlSignature);

  if (jku !== `https://webhooks.${truelayerUrlName()}.com/.well-known/jwks`) {
    functions.logger.error("JKU does not match expected version", {
      correlationId: correlationId,
      headerJKU: jku,
      expectedJKU: `https://webhooks.${truelayerUrlName()}.com/.well-known/jwks`,
    });
    return false;
  }

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  let jwks: string;

  if (cachedJwks && cacheDate && cacheDate > oneDayAgo) {
    functions.logger.log("Cached jwks found", {
      correlationId: correlationId,
    });
    jwks = cachedJwks;
  } else {
    functions.logger.log("No cached jwks, retrieving from url", {
      correlationId: correlationId,
    });
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

    functions.logger.log("Truelayer verification sucessful", {
      correlationId: correlationId,
    });
    return true;
  } catch (err) {
    functions.logger.error("Failed to verify Truelayer signature", {
      correlationId: correlationId,
      error: err,
    });
    return false;
  }
};
