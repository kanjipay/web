
import { Router } from "express";
import * as jwktopem from 'jwk-to-pem';


const routes = Router();

routes.get("/config", async (req, res, next) => {
  res.status(200).json({
    jwksUrl: `${process.env.BASE_SERVER_URL}/clientApi/v1/jwks`
  })
})

routes.get("/jwks", async (req, res, next) => {
  const privateKey = JSON.parse(process.env.JWKS_PRIVATE_KEY)
  console.log(privateKey);
  console.log(privateKey.keys)
  const [firstKey] = privateKey.keys
  const publicKey = jwktopem(firstKey)  
  res.send(publicKey);
})

export default routes 

  