import express from "express";
import ordersRoutes from "./routes/ordersRoutes";
import paymentAttemptsRoutes from "./routes/paymentAttemptsRoutes";
import cors from "cors";
import { checkFirebaseAuthToken } from "../middleware/auth";
import { errorHandler } from "../middleware/errorHandler";

const app = express();

const corsInstance = cors({ origin: process.env.CLIENT_URL });
app.use(corsInstance);
app.options("*", corsInstance); // Think this is needed for preflight requests

// These are needed to read request body (as JSON or urlencoded)
app.use(express.json());
app.use(express.urlencoded());

app.use("/orders", ordersRoutes);
app.use("/payment-attempts", paymentAttemptsRoutes);

// This is called whenever an error is raised in an endpoint
app.use(errorHandler);

// Do this to enable protected routes
// app.use('/orders', checkFirebaseAuthToken, ordersRoutes)

export default app;
