import { Router } from "express";
import { validate } from "../../../shared/utils/validate";
import PayeesController from "../controllers/PayeesController";
import { AllowedSchema } from "express-json-validator-middleware";

const controller = new PayeesController();
const routes = Router();

const updatePayeeBodySchema: AllowedSchema = {
  type: "object",
  required: ["merchantId", "crezcoUserId"],
  properties: {
    merchantId: {
      type: "string",
    },
    crezcoUserId: {
      type: "string",
    },
  }
}

routes.post(
  "/update",
  validate({ body: updatePayeeBodySchema }),
  controller.update)

export default routes;
