import axios from "axios";
import PaymentAttemptStatus from "../../../shared/enums/PaymentAttemptStatus";
import { HttpError, HttpStatusCode } from "../../../shared/utils/errors";
import LoggingController from "../../../shared/utils/loggingClient";
import { receivePaymentUpdate } from "./receivePaymentUpdate";
import * as jwt from "jsonwebtoken";
import * as jwkToPem from "jwk-to-pem";

const keyCache = new Map()

export const handleMoneyhubPaymentUpdate = async (req, res, next) => {
  try {
    const loggingClient = new LoggingController("Moneyhub Webhook");

    const token = req.body.toString()
    const decoded = jwt.decode(token, { complete: true })
    const currKeyId = decoded.header.kid

    // If keyId not in cache, make a call to the endpoint that has the up to date ones
    if (!keyCache.has(currKeyId)) {
      const configRes = await axios.get("https://identity.moneyhub.co.uk/oidc/.well-known/openid-configuration")
      const jwkUri = configRes.data.jwks_uri
      const jwksRes = await axios.get(jwkUri)
      const jwks = jwksRes.data
      const loadedKeys = jwks.keys.filter(key => key.use === "sig")

      keyCache.clear()

      for (const key of loadedKeys) {
        const keyId = key.kid
        keyCache.set(keyId, key)
      }

      // If the received key id is not in the ones retrieved from Moneyhub, raise error
      if (!keyCache.has(currKeyId)) {
        next(new HttpError(HttpStatusCode.UNAUTHORIZED, "Unauthorized"));
        return;
      }
    }

    const key = keyCache.get(currKeyId);
    const pem = jwkToPem(key);

    let payload

    try {
      payload = jwt.verify(token, pem)
    } catch (err) {
      console.log(err)
      next(new HttpError(HttpStatusCode.UNAUTHORIZED, "Unauthorized"));
      return;
    }
    
    const data = payload.events["urn:com:moneyhub:events:payment-completed"] || payload.events["urn:com:moneyhub:events:payment-rejected"]
    const { paymentId, status } = data

    const paymentAttemptStatus = status === "completed" ? PaymentAttemptStatus.SUCCESSFUL : PaymentAttemptStatus.FAILED

    await receivePaymentUpdate(
      paymentId,
      paymentAttemptStatus,
      null,
      loggingClient,
      next
    );

    res.sendStatus(200)

  } catch (err) {
    console.log(err)
    res.sendStatus(500)
  }
}