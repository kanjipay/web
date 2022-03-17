import { Router } from "express";
import { handlePaymentUpdate } from "./plaid/handlePaymentUpdate";

const routes = Router();

routes.post("/plaid", handlePaymentUpdate);

export default routes;
