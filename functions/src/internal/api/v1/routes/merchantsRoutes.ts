import { Router } from "express";
import { RequestValidator } from "../../../../shared/middleware/requestValidator";
import MerchantsController from "../controllers/MerchantsController";

const controller = new MerchantsController();
const routes = Router();

routes.post(
  "/:merchantId/review",
  new RequestValidator({ 
    approvalStatus: "string"
  }, "body").validate,
  controller.review
);

export default routes;
