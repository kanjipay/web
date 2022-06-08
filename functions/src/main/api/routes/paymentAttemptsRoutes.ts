import { Router } from "express";
import { validate } from "../../../shared/utils/validate";
import { PaymentAttemptsController } from "../controllers/PaymentAttemptsController";
import { AllowedSchema } from "express-json-validator-middleware";

const paymentAttemptsController = new PaymentAttemptsController();
const paymentAttemptsRoutes = Router();

const createCrezcoPaymentAttemptSchema: AllowedSchema = {
  type: "object",
  required: ["orderId", "crezcoBankCode", "countryCode", "deviceId"],
  properties: {
    orderId: {
      type: "string",
    },
    crezcoBankCode: {
      type: "string"
    },
    countryCode: {
      type: "string"
    },
    deviceId: {
      type: "string"
    },
  },
}

paymentAttemptsRoutes.post(
  "/crezco",
  validate({ body: createCrezcoPaymentAttemptSchema }),
  paymentAttemptsController.createCrezco
)

export default paymentAttemptsRoutes;
