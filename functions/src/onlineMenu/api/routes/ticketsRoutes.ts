import { Router } from "express";
import { authenticate } from "../../../shared/middleware/auth";
import TicketsController from "../controllers/TicketsController";

const ticketsController = new TicketsController();
const ticketsRoutes = Router();

ticketsRoutes.get("/", authenticate, ticketsController.index);

export default ticketsRoutes;
