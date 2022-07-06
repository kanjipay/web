import { Router } from "express"
import { validate } from "../../../../shared/utils/validate"
import { AllowedSchema } from "express-json-validator-middleware"
import { MerchantUsersController } from "../../controllers/merchant/MerchantUsersController"

const merchantUsersController = new MerchantUsersController()
const merchantUsersRoutes = Router({ mergeParams: true })

const sendInvitesSchema: AllowedSchema = {
  type: "object",
  required: ["inviteData"],
  properties: {
    inviteData: {
      type: "array",
      items: {
        type: "object",
        required: ["email", "name"],
        properties: {
          email: {
            type: "string",
          },
          name: {
            type: "string",
          },
        },
      },
    },
  },
}

merchantUsersRoutes.post(
  "/invites",
  validate({ body: sendInvitesSchema }),
  merchantUsersController.sendInvites
);

merchantUsersRoutes.get("/", merchantUsersController.getUsers)

export default merchantUsersRoutes
