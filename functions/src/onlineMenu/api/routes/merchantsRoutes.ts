import { Router } from "express";
import { authenticate } from "../../../shared/middleware/authenticate";
import MerchantsController from "../controllers/MerchantsController";

const merchantsController = new MerchantsController();
const merchantRoutes = Router();

merchantRoutes.post("/create", authenticate, merchantsController.create);

export default merchantRoutes;