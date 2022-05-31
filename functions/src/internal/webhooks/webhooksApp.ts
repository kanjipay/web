import * as express from "express";
import { checkMoneyhubIp } from "./moneyhub/checkMoneyhubIp";
import { handleMoneyhubPaymentUpdate } from "./moneyhub/handleMoneyhubPaymentUpdate";
import { verifyMoneyhub } from "./moneyhub/verifyMoneyhub";
import { handleCrezcoPaymentUpdate } from "./crezco/handleCrezcoPaymentUpdate";
import { verifyCrezco } from "./crezco/verifyCrezco";
import { setCors } from "../../shared/utils/express";

const webhooksApp = express()

setCors(webhooksApp, true)

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
