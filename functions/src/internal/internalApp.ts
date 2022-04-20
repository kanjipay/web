import * as express from "express";
import * as bodyParser from "body-parser"
import { errorHandler } from "../shared/middleware/errorHandler";
import webhooksApp from "./webhooks/webhooksApp";
import apiApp from "./api/apiApp";
import { verifyDomain } from "../shared/middleware/verifyDomain";

const main = express();

// Needed for reading request body
main.use(express.json());
main.use(express.urlencoded({ extended: true }));
main.use(bodyParser.raw({ type: "application/jwt" }))

main.use("/api/v1", verifyDomain, apiApp);
main.use("/webhooks/v1", webhooksApp)

main.use(errorHandler);

export default main;
