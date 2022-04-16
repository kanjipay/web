import * as express from "express";
import * as cors from "cors";
import v1App from "./v1/v1App";

const webhookApp = express();

const corsInstance = cors({ origin: "*" });
webhookApp.use(corsInstance);
webhookApp.options("*", corsInstance); // Think this is needed for preflight requests

webhookApp.use("/v1", v1App)

export default webhookApp;
