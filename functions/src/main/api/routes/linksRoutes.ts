import { Router } from "express";
import { AllowedSchema } from "express-json-validator-middleware";
import { validate } from "../../../shared/utils/validate";
import { LinksController } from "../controllers/LinksController";

const linksController = new LinksController();
const linksRoutes = Router();

const createLinkSchema: AllowedSchema = {
  type: "object",
  required: ["path"],
  properties: {
    path: {
      type: "string",
    },
    stateId: {
      type: "string",
    },
  },
};

linksRoutes.post(
  "/",
  validate({ body: createLinkSchema }),
  linksController.create
);

linksRoutes.get("/l/:linkId", linksController.get);

linksRoutes.put("/l/:linkId/accept", linksController.accept);

export default linksRoutes;
