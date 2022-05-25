import * as express from "express";
import ordersRoutes from "./routes/ordersRoutes";
import ticketsRoutes from "./routes/ticketsRoutes";
import authRoutes from "./routes/authRoutes";
import merchantRoutes from "./routes/merchantsRoutes";
import { setCors } from "../../shared/utils/setCors";

const apiApp = express();

setCors(apiApp)

apiApp.use("/orders", ordersRoutes);
apiApp.use("/tickets", ticketsRoutes);
apiApp.use("/auth", authRoutes);
apiApp.use("/merchants", merchantRoutes);
apiApp.get("/status", (req, res) => {
  res.sendStatus(200)
})

export default apiApp;
