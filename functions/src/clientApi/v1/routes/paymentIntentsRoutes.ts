import { Router } from "express";
import PaymentIntentsController from "../controllers/PaymentIntentsController";
import { AllowedSchema } from "express-json-validator-middleware";
import { validate } from "../../../shared/utils/validate";

const paymentIntentsRouter = Router()
const paymentIntentsController = new PaymentIntentsController()

const createPaymentIntentSchema: AllowedSchema = {
  type: "object",
  required: ["amount", "successUrl", "cancelledUrl", "payeeId"],
  properties: {
    amount: {
      type: "integer",
      minimum: 1,
      maximum: 100 * 1000
    },
    currency: {
      type: "string",
      enum: ["GBP", "EUR"]
    },
    successUrl: {
      type: "string",
      format: "uri"
    },
    cancelledUrl: {
      type: "string",
      format: "uri"
    },
    payeeId: {
      type: "string",
    }
  }
}

paymentIntentsRouter.post(
  "/", 
  validate({ body: createPaymentIntentSchema }), 
  paymentIntentsController.createPaymentIntent
)

export default paymentIntentsRouter