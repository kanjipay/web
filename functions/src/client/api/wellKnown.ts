import * as jose from "node-jose";
import * as ms from "ms";
import { Router } from "express";

const routes = Router();

let KEYSTORE = jose.JWK.createKeyStore();
let ROTATE_TIME = Date.now();

async function rotateKey() {
  KEYSTORE = jose.JWK.createKeyStore();
  KEYSTORE.generate("RSA", 2048, { alg: "RS256", use: "sig" });
}

routes.get("/config", async (req, res, next) => {
  res.status(200).json({
    jwksUrl: `${process.env.BASE_SERVER_URL}/clientApi/.well-known/jwks`
  })
})

routes.get("/jwks", async (req, res, next) => {
  if (Date.now() > ROTATE_TIME){
    rotateKey();
    ROTATE_TIME = Date.now() + ms('1d');
  }
  res.status(200).json(KEYSTORE.toJSON())
})

rotateKey();

export default routes