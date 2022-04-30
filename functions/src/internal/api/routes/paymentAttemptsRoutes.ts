import { Router } from "express";
import { validate } from "../../../shared/utils/validate";
import PaymentAttemptsController from "../controllers/PaymentAttemptsController";
import { AllowedSchema } from "express-json-validator-middleware";

const controller = new PaymentAttemptsController();
const routes = Router();

const createPaymentAttemptSchema: AllowedSchema = {
  type: "object",
  required: ["paymentIntentId", "moneyhubBankId", "deviceId", "stateId", "clientState"],
  properties: {
    paymentIntentId: {
      type: "string",
    },
    moneyhubBankId: {
      type: "string"
    },
    deviceId: {
      type: "string"
    },
    stateId: {
      type: "string"
    },
    clientState: {
      type: "string"
    }
  },
}

routes.post(
  "/",
  validate({ body: createPaymentAttemptSchema }),
  controller.create
);

const isLocal = process.env.IS_LOCAL === "TRUE"
const confirmPaymentAttemptRequiredFields = ["code", "state"]
const confirmPaymentAttemptProperties = {
  code: {
    type: "string"
  },
  state: {
    type: "string"
  },
} as const


if (!isLocal) {
  confirmPaymentAttemptRequiredFields.push("idToken")
  confirmPaymentAttemptProperties["idToken"] = {
    type: "string"
  }
}

const confirmPaymentAttemptSchema: AllowedSchema = {
  type: "object",
  required: confirmPaymentAttemptRequiredFields,
  properties: confirmPaymentAttemptProperties
}

routes.post(
  "/confirm",
  validate({ body: confirmPaymentAttemptSchema }),
  controller.confirm
);

routes.post(
  "/pa/:paymentAttemptId/check-status",
  controller.checkPayment
)

export default routes;
