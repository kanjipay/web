import Environment from "../enums/Environment";
import * as cors from "cors"
import { Express } from "express";

export function setCors(app: Express, allowAll: boolean = false) {
  let origin: string

  if (allowAll) {
    origin = "*"
  } else {
    const strictEnvironments: string[] = [Environment.PROD, Environment.STAGING]
    origin = strictEnvironments.includes(process.env.ENVIRONMENT) ? process.env.CLIENT_URL : "*"
  }
  
  const corsInstance = cors({ origin })
  app.use(corsInstance);
  app.options("*", corsInstance);
}