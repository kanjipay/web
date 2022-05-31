import * as express from "express";
import { errorHandler } from "../shared/middleware/errorHandler";
import { statusHandler } from "../shared/middleware/statusHandler";
import { setBodyParser } from "../shared/utils/express";
import { checkClientCredentials } from "./shared/authenticateClient";
import v1App from "./v1/v1App";
import wellKnown from "./wellKnown/wellKnown";

const main = express()

setBodyParser(main)

main.use("/v1", checkClientCredentials, v1App)
main.use("/.well-known", wellKnown)
main.get("/status", statusHandler)

main.use(errorHandler)

export default main;