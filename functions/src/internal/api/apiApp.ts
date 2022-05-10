import * as express from "express";
import * as cors from "cors";
import payeesRoutes from "./routes/payeesRoutes";
import linksRoutes from "./routes/linksRoutes";
import paymentAttemptsRoutes from "./routes/paymentAttemptsRoutes";
import paymentIntentsRoutes from "./routes/paymentIntentsRoutes";
import loggingRoutes from "./routes/loggingRoutes";
import clientsRoutes from "./routes/clientsRoutes";
import banksRoutes from "./routes/banksRoutes";

const apiApp = express();

const origin = process.env.ENVIRONMENT === "DEV" ? "*" : process.env.CLIENT_URL;
const corsInstanceApi = cors({ origin });
apiApp.use(corsInstanceApi);
apiApp.options("*", corsInstanceApi);

apiApp.use("/payment-attempts", paymentAttemptsRoutes);
apiApp.use("/payment-intents", paymentIntentsRoutes);
apiApp.use("/payees", payeesRoutes);
apiApp.use("/clients", clientsRoutes);
apiApp.use("/links", linksRoutes);
apiApp.use("/banks", banksRoutes);
apiApp.use("/log", loggingRoutes);
apiApp.get("/status", (req, res) => {
  res.sendStatus(200)
})

export default apiApp;
