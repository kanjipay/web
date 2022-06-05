import { Router } from "express";
import ClientsController from "../controllers/ClientsController";
import { AllowedSchema } from "express-json-validator-middleware";
import { validate } from "../../../shared/utils/validate";

const controller = new ClientsController();
const clientsRoutes = Router();

const createClientSchema: AllowedSchema = {
  type: "object",
  required: ["companyName"],
  properties: {
    companyName: {
      type: "string",
    },
  }
}

clientsRoutes.post(
  "/",
  validate({ body: createClientSchema }),
  controller.create
);

export default clientsRoutes;
