import { Router } from "express"
import { EventRecurrencesController } from "../../controllers/merchant/EventRecurrencesController"

const eventRecurrencesController = new EventRecurrencesController()
const eventRecurrencesRoutes = Router({ mergeParams: true })

eventRecurrencesRoutes.post(
  "/",
  eventRecurrencesController.create
)

export default eventRecurrencesRoutes
