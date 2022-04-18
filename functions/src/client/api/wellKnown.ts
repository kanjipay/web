
import * as ms from "ms";
import { Router } from "express";
import * as jwksKey from "../../shared/middleware/jwksKey"

const routes = Router();

let ROTATE_TIME = Date.now();

routes.get("/config", async (req, res, next) => {
  res.status(200).json({
    jwksUrl: `${process.env.BASE_SERVER_URL}/clientApi/.well-known/jwks`
  })
})

routes.get("/jwks", async (req, res, next) => {
  if (Date.now() > ROTATE_TIME){
    await jwksKey.rotateKey();
    ROTATE_TIME = Date.now() + ms('1d');
  }
  res.status(200).json(jwksKey.KEYSTORE.toJSON())
})

jwksKey.rotateKey();

export default routes