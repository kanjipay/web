import * as express from "express";
import * as cors from "cors";
import { checkMoneyhubIp } from "./moneyhub/checkMoneyhubIp";
import { handleMoneyhubPaymentUpdate } from "./moneyhub/handleMoneyhubPaymentUpdate";
import { handleCrezcoPaymentUpdate } from "./crezco/handleCrezcoPaymentUpdate";
import { verifyMoneyhub } from "./moneyhub/verifyMoneyhub";

const webhooksApp = express();

const corsInstance = cors({ origin: "*" });
webhooksApp.use(corsInstance);
webhooksApp.options("*", corsInstance);
webhooksApp.use(express.json());

webhooksApp.post(
  "/moneyhub", 
  checkMoneyhubIp, 
  verifyMoneyhub,
  handleMoneyhubPaymentUpdate
);

webhooksApp.post(
  "/crezco", 
  handleCrezcoPaymentUpdate
);

export default webhooksApp;
