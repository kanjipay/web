import * as express from "express";
import v1App from "./v1/v1App";
import jwks from "./jwks";

const main = express();

main.use(express.json());
main.use(express.urlencoded({ extended: true }));

main.use("/v1", v1App)
main.use("/v1", jwks)

export default main;