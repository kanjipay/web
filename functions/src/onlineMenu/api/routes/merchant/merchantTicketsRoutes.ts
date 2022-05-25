import { Router } from "express";
import { authenticate } from "../../../../shared/middleware/authenticate";
import { validate } from "../../../../shared/utils/validate";
import { AllowedSchema } from "express-json-validator-middleware";
import MerchantTicketsController from "../../controllers/merchant/MerchantTicketsController";

const merchantTicketsController = new MerchantTicketsController();
const merchantTicketsRoutes = Router({ mergeParams: true });

const checkTicketBodySchema: AllowedSchema = {
  type: "object",
  required: ["eventId"],
  properties: {
    eventId: {
      type: "string"
    }
  }
}

merchantTicketsRoutes.post(
  "/:ticketId/check", 
  validate({ body: checkTicketBodySchema }),
  authenticate, 
  merchantTicketsController.check
)

export default merchantTicketsRoutes;
