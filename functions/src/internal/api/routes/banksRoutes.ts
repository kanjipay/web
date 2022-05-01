import { Router } from "express";
import BanksController from "../controllers/BanksController";

const banksController = new BanksController();
const banksRoutes = Router();

banksRoutes.get("/", banksController.index);

export default banksRoutes;
