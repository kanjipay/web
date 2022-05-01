import * as express from "express";
import { errorHandler } from "../shared/middleware/errorHandler";
import { checkClientCredentials } from "./shared/authenticateClient";
import v1App from "./v1/v1App";
import wellKnown from "./wellKnown/wellKnown";

const main = express();

main.use(express.json());
main.use(express.urlencoded({ extended: true }));

main.use("/v1", checkClientCredentials, v1App)
main.use("/.well-known", wellKnown)

main.use(errorHandler)

export default main;