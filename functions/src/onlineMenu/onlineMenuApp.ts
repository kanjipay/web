import * as express from "express";
import { errorHandler } from "../shared/middleware/errorHandler";
import { statusHandler } from "../shared/middleware/statusHandler";
import { setBodyParser } from "../shared/utils/express";
import apiApp from "./api/apiApp";
import webhooksApp from "./webhooks/webhooksApp";

const main = express();

setBodyParser(main)

main.use("/api/v1", apiApp)
main.use("/webhooks/v1", webhooksApp)
main.get("/status", statusHandler)

main.use(errorHandler)

export default main;