import * as express from "express";
import * as cors from "cors";
import { checkMoneyhubIp } from "./moneyhub/checkMoneyhubIp";
import { handleMoneyhubPaymentUpdate } from "./moneyhub/handleMoneyhubPaymentUpdate";
import { verifyMoneyhub } from "./moneyhub/verifyMoneyhub";
import { handleCrezcoPaymentUpdate } from "./crezco/handleCrezcoPaymentUpdate";
import { verifyCrezco } from "./crezco/verifyCrezco";

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

webhooksApp.post(
  "/crezco",
  verifyCrezco,
  handleCrezcoPaymentUpdate
)

export default webhooksApp;
