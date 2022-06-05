import * as express from "express";
import { setCors } from "../../shared/utils/express";
import clientsRoutes from "./routes/clientsRoutes";
import payeesRouter from "./routes/payeesRoutes";
import paymentIntentsRouter from "./routes/paymentIntentsRoutes";
import refundsRouter from "./routes/refundsRoutes";

const app = express();

setCors(app, true)

app.use("/payment-intents", paymentIntentsRouter)
app.use("/refunds", refundsRouter)
app.use("/payees", payeesRouter)
app.use("/clients", clientsRoutes)

export default app;