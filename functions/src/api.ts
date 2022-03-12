import * as express from "express";
import * as cors from "cors";
import * as bodyParser from "body-parser";

// Handler functions
import { createOrder } from "./handlers/order";
import { paymentAttempt } from "./handlers/paymentAttempt";

//initialize express server
const app = express();
const main = express();

//tighten later
const corsInstance = cors({ origin: "*" });
main.use(corsInstance);
main.options("*", corsInstance); // Think this is needed for preflight requests

//add the path to receive request and set json as bodyParser to process the body
main.use("/v1", app);
main.use(bodyParser.json());
main.use(bodyParser.urlencoded({ extended: false }));

// Create new order
app.post("/orders", async (req, res) => {
  createOrder(req, res);
});

// Create new Plaid link-token for a payment attempt
app.post("/payment-attempts", async (req, res) => {
  paymentAttempt(req, res);
});

export { main, app };
