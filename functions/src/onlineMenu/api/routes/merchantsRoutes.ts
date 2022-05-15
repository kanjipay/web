import { Router } from "express";
import { authenticate } from "../../../shared/middleware/authenticate";
import MerchantsController from "../controllers/MerchantsController";
import { validate } from "../../../shared/utils/validate";
import { AllowedSchema } from "express-json-validator-middleware";

const merchantsController = new MerchantsController();
const merchantRoutes = Router();
const createMerchantSchema: AllowedSchema = {
    type: "object",
    required: ["accountNumber", "address", "companyName", "displayName", "sortCode", "description"],
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
      }
    }
  }

merchantRoutes.post("/create", 
                    authenticate,validate({ body: createMerchantSchema }), merchantsController.create);

export default merchantRoutes;