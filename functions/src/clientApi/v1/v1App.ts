import * as express from "express";
import payeesRouter from "./routes/payeesRoutes";
import paymentIntentsRouter from "./routes/paymentIntentsRoutes";
import refundsRouter from "./routes/refundsRoutes";

const app = express();

app.use("/payment-intents", paymentIntentsRouter)
app.use("/refunds", refundsRouter)
app.use("/payees", payeesRouter)

export default app;