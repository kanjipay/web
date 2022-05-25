import * as express from "express";
import { errorHandler } from "../shared/middleware/errorHandler";
import apiApp from "./api/apiApp";
import webhooksApp from "./webhooks/webhooksApp";

const main = express();

main.use(express.json());
main.use(express.urlencoded({ extended: true }));

main.use("/api/v1", apiApp)
main.use("/webhooks/v1", webhooksApp)
main.get("/status", (req, res) => {
  res.sendStatus(200)
})

main.use(errorHandler)

export default main;