import { Router } from "express";
import RefundsController from "../controllers/RefundsController";
import { AllowedSchema } from "express-json-validator-middleware";
import { validate } from "../../../shared/utils/validate";

const refundsRouter = Router()
const refundsController = new RefundsController()

const createRefundAttemptSchema: AllowedSchema = {
  type: "object",
  required: ["chargeId"],
  properties: {
    chargeId: {
      type: "string"
    }
  }
}

refundsRouter.post(
  "/",
  validate({ body: createRefundAttemptSchema }),
  refundsController.createRefundAttempt
)

export default refundsRouter