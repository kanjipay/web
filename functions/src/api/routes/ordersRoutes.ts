import { Router } from "express";
import OrdersController from "../controllers/OrdersController";
import { readOrder } from "../../middleware/readOrder";
import { RequestValidator } from "../../middleware/requestValidator";

const controller = new OrdersController();
const routes = Router();

routes.post("/", controller.create);

routes.post(
  "/email-receipt",
  new RequestValidator({ email: "string", orderId: "string" }, "body").validate,
  readOrder,
  controller.sendEmailReceipt
);

export default routes;
