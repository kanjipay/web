import * as express from "express";
import * as cors from "cors";
import ordersRoutes from "./routes/ordersRoutes";

const apiApp = express();

const origin = process.env.ENVIRONMENT != "PROD" ? "*" : process.env.CLIENT_URL;
const corsInstanceApi = cors({ origin });
apiApp.use(corsInstanceApi);
apiApp.options("*", corsInstanceApi);

apiApp.use("/orders", ordersRoutes);
apiApp.get("/status", (req, res) => {
  res.sendStatus(200)
})

export default apiApp;
