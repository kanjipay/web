import { Router } from "express"
import { MerchantEventAttendeesController } from "../../controllers/merchant/MerchantEventAttendeesController"

const merchantEventAttendeesController = new MerchantEventAttendeesController()
const merchantEventAttendeesRoutes = Router({ mergeParams: true })

merchantEventAttendeesRoutes.get(
  "/:eventId",
  merchantEventAttendeesController.getEventAttendees
)

export default merchantEventAttendeesRoutes
