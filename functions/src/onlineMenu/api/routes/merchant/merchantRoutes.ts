import { Router } from "express";
import merchantTicketsRoutes from "./merchantTicketsRoutes";

const merchantRoutes = Router({ mergeParams: true });

merchantRoutes.use("/tickets", merchantTicketsRoutes)

export default merchantRoutes;