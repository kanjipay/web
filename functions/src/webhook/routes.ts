import { Router } from "express";
import { checkPlaidIp } from "./plaid/checkPlaidIp";
import { handlePlaidPaymentUpdate } from "./plaid/handlePlaidPaymentUpdate";
import { handleTruelayerPaymentUpdate } from "./truelayer/handleTruelayerPaymentUpdate";

const routes = Router();

routes.post("/plaid", checkPlaidIp, handlePlaidPaymentUpdate);
routes.post("/truelayer", handleTruelayerPaymentUpdate);

export default routes;
