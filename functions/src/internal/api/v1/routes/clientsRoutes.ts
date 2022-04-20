import { Router } from "express";
import ClientsController from "../controllers/ClientsController";

const controller = new ClientsController();
const routes = Router();

routes.post("/clients", controller.create);

export default routes;
