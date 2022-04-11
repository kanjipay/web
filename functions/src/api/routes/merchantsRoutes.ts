import { Router } from "express";
import { RequestValidator } from "../../middleware/requestValidator";
import MerchantsController from "../controllers/MerchantsController";

const controller = new MerchantsController();
const routes = Router();

routes.post(
  "/",
  new RequestValidator({ 
    accountNumber: "string",
    sortCode: "string",
    companyName: "string",
    displayName: "string",
    address: "string",
    userId: "string"
  }, "body").validate,
  controller.create
);

export default routes;
