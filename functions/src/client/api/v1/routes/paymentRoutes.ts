import { Router } from "express";
import PaymentsController from "../controllers/PaymentsController";

const paymentsRouter = Router()
const paymentsController = new PaymentsController()

paymentsRouter.post("/intents", paymentsController.createPaymentIntent)
paymentsRouter.post("/refunds", paymentsController.createRefundIntent)

export default paymentsRouter