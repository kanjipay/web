import * as jwt from "jsonwebtoken";
import * as jwkToPem from "jwk-to-pem";
import { v4 as uuid } from "uuid";

export function createSignature(payload: any, expireSeconds: number = 60 * 10) {
  const jwks = JSON.parse(process.env.JWKS_PRIVATE_KEY);
  const [key] = jwks.keys;
  const pem = jwkToPem(key, { private: true });

  try {
    const signature = jwt.sign(payload, pem, {
      keyid: key.kid,
      jwtid: uuid(),
      expiresIn: expireSeconds,
      algorithm: "RS256",
    });

    return { signature };
  } catch (err) {
    return { signatureError: err };
  }
}
