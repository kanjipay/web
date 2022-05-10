import axios from "axios";
import * as sha256 from "sha256";
import LoggingController from "../../shared/utils/loggingClient";
import * as jwt from "jsonwebtoken";
import * as jwkToPem from "jwk-to-pem";
import { v4 as uuid } from "uuid";

export function createSignature(payload: any, audience: string) {
  const jwks = JSON.parse(process.env.JWKS_PRIVATE_KEY);
  const [key] = jwks.keys;
  const pem = jwkToPem(key, { private: true });

  try {
    const signature = jwt.sign(payload, pem, {
      keyid: key.kid,
      subject: `${process.env.BASE_SERVER_URL}/clientApi`,
      issuer: `${process.env.BASE_SERVER_URL}/internal`,
      audience,
      jwtid: uuid(),
      expiresIn: 3600,
      algorithm: "RS256",
    });

    return { signature }
  } catch (err) {
    return { signatureError: err }
  }
}

export async function sendWebhook(webhookUrl: string, body: Object) {
  const logger = new LoggingController("Sending webhook");
  
  const bodyString = JSON.stringify(body);
  const bodyHash = sha256(bodyString);

  // iat is generated automatically by jwt.sign so no need to include it here
  const payload = {
    body_sha_256: bodyHash
  };

  const { signature, signatureError } = createSignature(payload, webhookUrl)

  if (signatureError) {
    logger.log("Creating signature failed", { signatureError })
    return
  }

  try {
    await axios.post(webhookUrl, body, {
      headers: {
        "mcp-signature": signature
      }
    });
  } catch (error) {
    logger.log("Posting to webhook url failed", { error });
    return false;
  }

  return true;
}
