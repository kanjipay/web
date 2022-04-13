import { Router } from "express";
import PaymentAttemptsController from "../controllers/PaymentAttemptsController";
import { readOrder } from "../../middleware/readOrder";
import { RequestValidator } from "../../middleware/requestValidator";

const controller = new PaymentAttemptsController();
const routes = Router();

routes.post(
  "/",
  new RequestValidator({ orderId: "string", openBankingProvider: "string" }, "body").validate,
  readOrder,
  controller.create
);

const swapCodeRequiredFields = { 
  code: "string", 
  state: "string", 
  nonce: "string"
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

// routes.get("/payees", controller.listPayees)

// routes.post(
//   "/payees", 
//   new RequestValidator({ accountNumber: "string", sortCode: "string", name: "string" }, "body").validate,
//   controller.addPayee
// )

export default routes;
