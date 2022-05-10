import { Router } from "express";
import { AllowedSchema } from "express-json-validator-middleware";
import { PaymentIntentCancelReason } from "../../../shared/enums/PaymentIntentCancelReason";
import { enumValues } from "../../../shared/utils/enumValues";
import { validate } from "../../../shared/utils/validate";
import PaymentIntentsController from "../controllers/PaymentIntentsController";

const paymentIntentsController = new PaymentIntentsController();
const paymentIntentsRoutes = Router();

const cancelPaymentIntentSchema: AllowedSchema = {
  required: ["cancelReason"],
  properties: {
    cancelReason: {
      type: "string",
      enum: enumValues(PaymentIntentCancelReason)
    }
  }
}

paymentIntentsRoutes.put(
  "/:paymentIntentId/cancel",
  validate({ body: cancelPaymentIntentSchema }),
  paymentIntentsController.cancel
);

export default paymentIntentsRoutes;
