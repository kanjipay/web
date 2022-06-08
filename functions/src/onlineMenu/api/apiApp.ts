import * as express from "express";
import ordersRoutes from "./routes/ordersRoutes";
import ticketsRoutes from "./routes/ticketsRoutes";
import merchantRoutes from "./routes/merchantsRoutes";
import { setCors } from "../../shared/utils/express";

const apiApp = express()

setCors(apiApp)

apiApp.use("/orders", ordersRoutes);
apiApp.use("/tickets", ticketsRoutes);
apiApp.use("/merchants", merchantRoutes);

export default apiApp;
