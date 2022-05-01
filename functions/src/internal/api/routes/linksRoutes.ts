import { Router } from "express";
import LinksController from "../controllers/LinksController";
import { AllowedSchema } from "express-json-validator-middleware";
import { validate } from "../../../shared/utils/validate";

const controller = new LinksController();
const routes = Router();

const createLinkSchema: AllowedSchema = {
  type: "object",
  required: ["path"],
  properties: {
    path: {
      type: "string",
    },
    stateId: {
      type: "string"
    }
  }
}

routes.post(
  "/",
  validate({ body: createLinkSchema }),
  controller.create
);

export default routes;
