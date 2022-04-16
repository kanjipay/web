import * as express from "express";
import ordersRoutes from "./routes/ordersRoutes";
import merchantsRoutes from "./routes/merchantsRoutes";
import linksRoutes from "./routes/linksRoutes";
import paymentAttemptsRoutes from "./routes/paymentAttemptsRoutes";
import loggingRoutes from "./routes/loggingRoutes";

const v1App = express();

v1App.use("/payment-attempts", paymentAttemptsRoutes);
v1App.use("/orders", ordersRoutes);
v1App.use("/merchants", merchantsRoutes);
v1App.use("/links", linksRoutes);
v1App.use("/log", loggingRoutes);
v1App.get("/status", (req, res) => {
  res.sendStatus(200)
})

export default v1App;
