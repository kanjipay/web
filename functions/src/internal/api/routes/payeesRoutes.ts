import { Router } from "express";
import { validate } from "../../../shared/utils/validate";
import PayeesController from "../controllers/PayeesController";
import { AllowedSchema } from "express-json-validator-middleware";
import { PayeeApprovalStatus } from "../../../clientApi/v1/controllers/PayeesController";
import { enumValues } from "../../../shared/utils/enumValues";

const controller = new PayeesController();
const routes = Router();

const reviewPayeeBodySchema: AllowedSchema = {
  type: "object",
  required: ["approvalStatus"],
  properties: {
    approvalStatus: {
      type: "string",
      enum: enumValues(PayeeApprovalStatus)
    }
  }
}

const reviewPayeeParamsSchema: AllowedSchema = {
  type: "object",
  required: ["payeeId"],
  properties: {
    payeeId: {
      type: "string",
    }
  }
}

routes.post(
  "/:payeeId/review",
  validate({ body: reviewPayeeBodySchema, params: reviewPayeeParamsSchema }),
  controller.review
);

export default routes;
