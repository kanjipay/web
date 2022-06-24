import { Router } from "express";
import { EventTicketsController } from "../controllers/EventTicketsController";

const eventTicketsController = new EventTicketsController();
const eventTicketsRoutes = Router();

eventTicketsRoutes.get("/:eventId", eventTicketsController.get);

export default eventTicketsRoutes;
