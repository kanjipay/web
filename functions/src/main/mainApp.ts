import * as express from "express";
import { errorHandler } from "../shared/middleware/errorHandler";
import { logRequest } from "../shared/middleware/logRequest";
import { statusHandler } from "../shared/middleware/statusHandler";
import { setBodyParser } from "../shared/utils/express";
import mainApiApp from "./api/mainApiApp";
import mainWebhooksApp from "./webhooks/mainWebhooksApp";

const mainApp = express();

setBodyParser(mainApp);

mainApp.use(logRequest);

mainApp.use("/api/v1", mainApiApp);
mainApp.use("/webhooks/v1", mainWebhooksApp);
mainApp.get("/status", statusHandler);

mainApp.use(errorHandler);

export default mainApp;
