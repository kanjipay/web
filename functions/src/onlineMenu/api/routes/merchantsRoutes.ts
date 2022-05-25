import { Router } from "express";
import { authenticate } from "../../../shared/middleware/authenticate";
import MerchantsController from "../controllers/MerchantsController";
import { validate } from "../../../shared/utils/validate";
import { AllowedSchema } from "express-json-validator-middleware";
import merchantRoutes from "./merchant/merchantRoutes";

const merchantsController = new MerchantsController();
const merchantsRoutes = Router({ mergeParams: true });
const createMerchantSchema: AllowedSchema = {
    type: "object",
    required: ["accountNumber", "address", "companyName", "displayName", "sortCode", "description", "imageAsFile"],
    properties: {
      accountNumber: {
        type: "string"
      },
      address: {
        type: "string"
      },
      companyName: {
        type: "string"
      },
      displayName: {
        type: "string"
      },
      sortCode: {
        type: "string"
      },
      description: {
        type: "string"
      },
      imageAsFile: {
        type: "object"
      }

    }
  }

merchantsRoutes.post(
  "/create", 
  authenticate,
  validate({ body: createMerchantSchema }), 
  merchantsController.create
);

merchantsRoutes.use("/m/:merchantId", authenticate, merchantRoutes)

export default merchantsRoutes;