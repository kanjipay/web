import { Router } from "express";
import PaymentAttemptsController from "../controllers/PaymentAttemptsController";
import { readOrder } from "../../middleware/readOrder";
import { RequestValidator } from "../../middleware/requestValidator";

const controller = new PaymentAttemptsController()
const routes = Router()

routes.post(
  '/', 
  new RequestValidator({ order_id: "string" }, "body").validate,
  readOrder,
  controller.create
)

export default routes