import { Router } from "express"
import { InvitesController } from "../controllers/InvitesController"

const invitesController = new InvitesController()
const invitesRoutes = Router()

invitesRoutes.post("/:inviteId/accept", invitesController.acceptInvite)

export default invitesRoutes
