import * as express from "express";
import * as cors from "cors";
import { checkMoneyhubIp } from "./checkMoneyhubIp";
import { handleMoneyhubPaymentUpdate } from "./handleMoneyhubPaymentUpdate";
import { verifyMoneyhub } from "./verifyMoneyhub";

const webhooksApp = express();

const corsInstance = cors({ origin: "*" });
webhooksApp.use(corsInstance);
webhooksApp.options("*", corsInstance);

webhooksApp.post(
  "/moneyhub", 
  checkMoneyhubIp, 
  verifyMoneyhub,
  handleMoneyhubPaymentUpdate
);

export default webhooksApp;
