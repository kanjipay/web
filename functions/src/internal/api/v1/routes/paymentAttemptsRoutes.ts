import { Router } from "express";
import PaymentAttemptsController from "../controllers/PaymentAttemptsController";
import { readOrder } from "../../../../shared/middleware/readOrder";
import { RequestValidator } from "../../../../shared/middleware/requestValidator";

const controller = new PaymentAttemptsController();
const routes = Router();

routes.post(
  "/",
  new RequestValidator({ orderId: "string" }, "body").validate,
  readOrder,
  controller.create
);

const swapCodeRequiredFields = { 
  code: "string", 
  state: "string", 
  paymentAttemptId: "string"
}

const isLocal = process.env.IS_LOCAL === "TRUE"

if (!isLocal) {
  swapCodeRequiredFields["idToken"] = "string"
}

routes.post(
  "/swap-code",
  new RequestValidator(swapCodeRequiredFields, "body").validate,
  controller.swapCode
);

export default routes;
