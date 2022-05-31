import * as express from "express";
import payeesRoutes from "./routes/payeesRoutes";
import linksRoutes from "./routes/linksRoutes";
import paymentAttemptsRoutes from "./routes/paymentAttemptsRoutes";
import paymentIntentsRoutes from "./routes/paymentIntentsRoutes";
import clientsRoutes from "./routes/clientsRoutes";
import banksRoutes from "./routes/banksRoutes";
import { setCors } from "../../shared/utils/express";

const apiApp = express()

setCors(apiApp)

apiApp.use("/payment-attempts", paymentAttemptsRoutes);
apiApp.use("/payment-intents", paymentIntentsRoutes);
apiApp.use("/payees", payeesRoutes);
apiApp.use("/clients", clientsRoutes);
apiApp.use("/links", linksRoutes);
apiApp.use("/banks", banksRoutes);

export default apiApp;
