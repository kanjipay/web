import * as express from "express";
import merchantsRouter from "./routes/merchantsRoutes";
import paymentsRouter from "./routes/paymentRoutes";

const app = express();

app.use("/payments", paymentsRouter)
app.use("/merchants", merchantsRouter)

export default app;