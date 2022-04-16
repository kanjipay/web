import * as express from "express";
import * as bodyParser from "body-parser"
// import { checkFirebaseAuthToken } from '../middleware/auth'
import { errorHandler } from "../shared/middleware/errorHandler";
import webhooksApp from "./webhooks/webhooksApp";
import apiApp from "./api/apiApp";

const main = express();

// Needed for reading request body
main.use(express.json());
main.use(express.urlencoded({ extended: true }));
main.use(bodyParser.raw({ type: "application/jwt" }))

main.use(errorHandler);

main.use("/api", apiApp);
main.use("/webhooks", webhooksApp)

export default main;
