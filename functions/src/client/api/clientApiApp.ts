import * as express from "express";
import { authenticateClient } from "../shared/authenticateClient";
import v1App from "./v1/v1App";
import wellKnown from "./wellKnown";

const main = express();

main.use(express.json());
main.use(express.urlencoded({ extended: true }));

main.use("/v1", authenticateClient, v1App)
main.use("/.well-known", wellKnown)

export default main;