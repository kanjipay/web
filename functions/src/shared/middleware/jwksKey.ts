import * as jose from "node-jose";

let KEYSTORE = jose.JWK.createKeyStore();

async function rotateKey() {
  let KEYSTORE = jose.JWK.createKeyStore();
  await KEYSTORE.generate("RSA", 2048, { alg: "RS256", use: "sig" });
}

export {KEYSTORE, rotateKey}