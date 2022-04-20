import { Router } from "express";
import * as jose from "node-jose";

const routes = Router();

routes.get("/config", async (req, res, next) => {
  res.status(200).json({
    jwksUrl: `${process.env.BASE_SERVER_URL}/clientApi/v1/jwks`
  })
})

routes.get("/jwks", async (req, res, next) => {
  const keyStore = await jose.JWK.asKeyStore(process.env.JWKS_PRIVATE_KEY);
  res.send(keyStore.toJSON());
})

export default routes