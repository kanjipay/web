import { Router } from "express";
import OrdersController from "../controllers/OrdersController";
import { readOrder } from "../../middleware/readOrder";
import { RequestValidator } from "../../middleware/requestValidator";

const controller = new OrdersController()
const routes = Router()

routes.post('/', controller.create)

routes.post(
  '/email-receipt', 
  (req, res) => {console.log(req.body)},
  new RequestValidator({ email: "string", order_id: "string"}, "body").validate, 
  readOrder,
  controller.sendEmailReceipt
)

export default routes