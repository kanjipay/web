import { Router } from "express";
import { handlePaymentUpdate } from "./handlePaymentUpdate";

const routes = Router()

routes.post('/', handlePaymentUpdate)

export default routes