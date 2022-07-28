import { Router } from "express"
import { EventRecurrencesController } from "../../controllers/merchant/EventRecurrencesController"

const eventRecurrencesController = new EventRecurrencesController()
const eventRecurrencesRoutes = Router({ mergeParams: true })

eventRecurrencesRoutes.post(
  "/",
  eventRecurrencesController.create
)

eventRecurrencesRoutes.put(
  "/:eventRecurrenceId",
  eventRecurrencesController.update
)

eventRecurrencesRoutes.delete(
  "/:eventRecurrenceId",
  eventRecurrencesController.delete
)

eventRecurrencesRoutes.post(
  "/:eventRecurrenceId/pr",
  eventRecurrencesController.createProduct
)

eventRecurrencesRoutes.put(
  "/:eventRecurrenceId/pr/:productRecurrenceId",
  eventRecurrencesController.updateProduct
)

eventRecurrencesRoutes.delete(
  "/:eventRecurrenceId/pr/:productRecurrenceId",
  eventRecurrencesController.deleteProduct
)

export default eventRecurrencesRoutes
