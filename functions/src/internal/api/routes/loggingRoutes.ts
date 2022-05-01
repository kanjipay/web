import { Router } from "express";
import AnalyticsController from "../controllers/analyticsController";

const controller = new AnalyticsController();
const routes = Router();

routes.post("/", controller.log);

export default routes;
