import * as express from "express";
import { errorHandler } from "../shared/middleware/errorHandler";
import webhooksApp from "./webhooks/webhooksApp";
import apiApp from "./api/apiApp";
import { verifyDomain } from "../shared/middleware/verifyDomain";
import { setBodyParser } from "../shared/utils/express";
import { statusHandler } from "../shared/middleware/statusHandler";

const main = express();

setBodyParser(main)

main.use("/api/v1", verifyDomain, apiApp);
main.use("/webhooks/v1", webhooksApp)
main.get("/status", statusHandler)

main.use(errorHandler);

export default main;
