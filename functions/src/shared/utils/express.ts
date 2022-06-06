import * as cors from "cors"
import { Express } from "express"
import * as express from "express"
import * as bodyParser from "body-parser"
import { isStrictEnvironment } from "./isStrictEnvironment";

export function setCors(app: Express, allowAll: boolean = !isStrictEnvironment(process.env.ENVIRONMENT)) {
  // const origin = allowAll ? "*" : process.env.CLIENT_URL
  
  const corsInstance = cors({ origin: "*" })

  app.use(corsInstance);
  app.options("*", corsInstance);
}

export function setBodyParser(app: Express) {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(bodyParser.raw({ type: "application/jwt" }))
}