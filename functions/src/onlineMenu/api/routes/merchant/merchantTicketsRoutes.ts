import { Router } from "express";
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
  merchantTicketsController.check
)

merchantTicketsRoutes.get(
  "/sales-data",
  merchantTicketsController.salesData
)

export default merchantTicketsRoutes;
