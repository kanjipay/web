import * as express from "express";
import * as cors from "cors";
import { handleMercadoPaymentUpdate } from "./handleMercadoPaymentUpdate";
import { verifyMercado } from "./verifyMercado";

const webhooksApp = express()

const corsInstanceApi = cors({ origin: "*" });
webhooksApp.use(corsInstanceApi);
webhooksApp.options("*", corsInstanceApi);

webhooksApp.post("/mercado", verifyMercado, handleMercadoPaymentUpdate)

export default webhooksApp