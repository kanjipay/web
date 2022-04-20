import * as express from "express";
import { errorHandler } from "../shared/middleware/errorHandler";
import { authenticateClient } from "./shared/authenticateClient";
import v1App from "./v1/v1App";
import wellKnown from "./wellKnown/wellKnown";

const main = express();

main.use(express.json());
main.use(express.urlencoded({ extended: true }));

main.use("/v1", authenticateClient, v1App)
main.use("/.well-known", wellKnown)

main.use(errorHandler)

export default main;