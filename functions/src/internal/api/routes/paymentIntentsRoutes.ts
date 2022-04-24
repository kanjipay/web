import { Router } from "express";
import PaymentIntentsController from "../controllers/PaymentIntentsController";

const paymentIntentsController = new PaymentIntentsController();
const paymentIntentsRoutes = Router();

paymentIntentsRoutes.put(
  "/:paymentIntentId/cancel",
  paymentIntentsController.cancel
);

export default paymentIntentsRoutes;
