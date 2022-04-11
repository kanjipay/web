import { Router } from "express";
import PaymentAttemptsController from "../controllers/PaymentAttemptsController";
import { readOrder } from "../../middleware/readOrder";
import { RequestValidator } from "../../middleware/requestValidator";

const controller = new PaymentAttemptsController();
const routes = Router();

routes.post(
  "/",
  new RequestValidator({ orderId: "string" }, "body").validate,
  readOrder,
  controller.create
);

routes.post(
  "/auth-url",
  new RequestValidator({ orderId: "string", bankId: "string" }, "body").validate,
  readOrder,
  controller.createAuthUrl
);



export default routes;
