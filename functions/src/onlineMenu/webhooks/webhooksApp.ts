import * as express from "express";
import * as cors from "cors";
import { handleMercadoPaymentUpdate } from "./handleMercadoPaymentUpdate";

const webhooksApp = express()

const corsInstanceApi = cors({ origin: "*" });
webhooksApp.use(corsInstanceApi);
webhooksApp.options("*", corsInstanceApi);

webhooksApp.post("/mercado", handleMercadoPaymentUpdate)

export default webhooksApp