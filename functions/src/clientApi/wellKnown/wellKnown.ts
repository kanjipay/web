import { Router } from "express";

const routes = Router();

routes.get("/config", async (req, res, next) => {
  res.status(200).json({
    jwksUrl: `${process.env.BASE_SERVER_URL}/clientApi/.well-known/jwks`
  })
})

routes.get("/jwks", async (req, res, next) => {
  res.status(200).json(process.env.JWKS_PUBLIC_KEY);
})

export default routes