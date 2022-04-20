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

const confirmPaymentAttemptRequiredFields = ["code", "state"]
const isLocal = process.env.IS_LOCAL === "TRUE"

if (!isLocal) {
  confirmPaymentAttemptRequiredFields.push("idToken")
}

const confirmPaymentAttemptSchema: AllowedSchema = {
  type: "object",
  required: confirmPaymentAttemptRequiredFields,
  properties: {
    code: {
      type: "string"
    },
    state: {
      type: "string"
    },
    idToken: {
      type: "string"
    }
  }
}

routes.post(
  "/confirm",
  validate({ body: confirmPaymentAttemptSchema }),
  controller.confirm
);

export default routes;
