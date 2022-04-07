import * as express from "express";
import ordersRoutes from "./routes/ordersRoutes";
import linksRoutes from "./routes/linksRoutes";
import paymentAttemptsRoutes from "./routes/paymentAttemptsRoutes";
import loggingRoutes from "./routes/loggingRoutes";
import * as cors from "cors";
// import { checkFirebaseAuthToken } from '../middleware/auth'
import { errorHandler } from "../middleware/errorHandler";
import { verifyDomain } from "../middleware/verifyDomain";

const main = express();
const app = express();

// const origin = process.env.ENVIRONMENT === "DEV" ? "*" : process.env.CLIENT_URL;
const origin = "*";

const corsInstance = cors({ origin });
// const corsInstance = cors({ origin: "*" })
main.use(corsInstance);
main.options("*", corsInstance); // Think this is needed for preflight requests

// These are needed to read request body (as JSON or urlencoded)
main.use(express.json());
main.use(express.urlencoded());

main.use("/v1", verifyDomain, app);

app.use("/payment-attempts", paymentAttemptsRoutes);
app.use("/orders", ordersRoutes);
app.use("/links", linksRoutes);
app.use("/log", loggingRoutes);

// This is called whenever an error is raised in an endpoint
app.use(errorHandler);

// Do this to enable protected routes
// app.use('/orders', checkFirebaseAuthToken, ordersRoutes)

export default main;
