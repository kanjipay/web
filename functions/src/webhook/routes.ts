import { Router } from "express";
import { checkMoneyhubIp } from "./moneyhub/checkMoneyhubIp";
import { handleMoneyhubPaymentUpdate } from "./moneyhub/handleMoneyhubPaymentUpdate";
import { checkPlaidIp } from "./plaid/checkPlaidIp";
import { handlePlaidPaymentUpdate } from "./plaid/handlePlaidPaymentUpdate";
import { handleTruelayerPaymentUpdate } from "./truelayer/handleTruelayerPaymentUpdate";

const routes = Router();

routes.post("/plaid", checkPlaidIp, handlePlaidPaymentUpdate);
routes.post("/truelayer", handleTruelayerPaymentUpdate);
routes.post("/moneyhub", checkMoneyhubIp, handleMoneyhubPaymentUpdate);

export default routes;
