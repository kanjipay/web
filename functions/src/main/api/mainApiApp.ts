import * as express from "express";
import { setCors } from "../../shared/utils/express";
import banksRoutes from "./routes/banksRoutes";
import linksRoutes from "./routes/linksRoutes";
import merchantsRoutes from "./routes/merchantsRoutes";
import ordersRoutes from "./routes/ordersRoutes";
import paymentAttemptsRoutes from "./routes/paymentAttemptsRoutes";
import ticketsRoutes from "./routes/ticketsRoutes";
import eventTicketsRoutes from "./routes/eventTicketsRoutes";

const mainApiApp = express();

setCors(mainApiApp)

mainApiApp.use("/banks", banksRoutes)
mainApiApp.use("/links", linksRoutes)
mainApiApp.use("/merchants", merchantsRoutes)
mainApiApp.use("/tickets", ticketsRoutes)
mainApiApp.use("/orders", ordersRoutes)
mainApiApp.use("/payment-attempts", paymentAttemptsRoutes)
mainApiApp.use("/event-tickets", eventTicketsRoutes)

export default mainApiApp