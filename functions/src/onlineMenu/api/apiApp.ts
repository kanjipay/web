import * as express from "express";
import * as cors from "cors";
import ordersRoutes from "./routes/ordersRoutes";
import ticketsRoutes from "./routes/ticketsRoutes";
import authRoutes from "./routes/authRoutes";

const apiApp = express();

const origin = process.env.ENVIRONMENT === "DEV" ? "*" : process.env.CLIENT_URL;
const corsInstanceApi = cors({ origin });
apiApp.use(corsInstanceApi);
apiApp.options("*", corsInstanceApi);

apiApp.use("/orders", ordersRoutes);
apiApp.use("/tickets", ticketsRoutes);
apiApp.use("/auth", authRoutes)
apiApp.get("/status", (req, res) => {
  res.sendStatus(200)
})

export default apiApp;
