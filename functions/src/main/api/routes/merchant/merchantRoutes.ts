import { Router } from "express"
import { MerchantController } from "../../controllers/merchant/MerchantController"
import merchantTicketsRoutes from "./merchantTicketsRoutes"
import { AllowedSchema } from "express-json-validator-middleware"
import { validate } from "../../../../shared/utils/validate"
import merchantUsersRoutes from "./merchantUsersRoutes"
import merchantEventAttendeesRoutes from "./merchantEventAttendeesRoutes"

const merchantController = new MerchantController()
const merchantRoutes = Router({ mergeParams: true })

merchantRoutes.use("/tickets", merchantTicketsRoutes)
merchantRoutes.use("/users", merchantUsersRoutes)
merchantRoutes.use("/eventAttendees", merchantEventAttendeesRoutes)

const addCrezcoUserIdSchema: AllowedSchema = {
  type: "object",
  required: ["crezcoUserId"],
  properties: {
    crezcoUserId: {
      type: "string",
    },
  },
}

merchantRoutes.put(
  "/crezco",
  validate({ body: addCrezcoUserIdSchema }),
  merchantController.addCrezcoUserId
);

merchantRoutes.post(
  "/create-stripe-account-link",
  merchantController.createStripeAccountLink
)

merchantRoutes.put(
  "/update-stripe-status",
  merchantController.updateStripeStatusIfNeeded
)

export default merchantRoutes
