import { Router } from "express";
import { RequestValidator } from "../../../../shared/middleware/requestValidator";
import LinksController from "../controllers/LinksController";

const controller = new LinksController();
const routes = Router();

routes.post(
  "/",
  new RequestValidator({ path: "string" }, "body").validate,
  controller.create
);

export default routes;
