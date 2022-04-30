import { Router } from "express";
import BanksController from "../controllers/BanksController";

const controller = new BanksController();
const routes = Router();

routes.get("/", controller.index);

export default routes;
