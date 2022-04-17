import { Router } from "express";
import MerchantsController from "../controllers/MerchantsController";

const merchantsRouter = Router()
const merchantsController = new MerchantsController()

merchantsRouter.post("/", merchantsController.create)
merchantsRouter.get("/", merchantsController.index)
merchantsRouter.get("/:merchantId", merchantsController.show)

export default merchantsRouter