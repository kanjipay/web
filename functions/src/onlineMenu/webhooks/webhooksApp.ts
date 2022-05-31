import * as express from "express";
import { handleMercadoPaymentUpdate } from "./handleMercadoPaymentUpdate";
import { verifyMercado } from "./verifyMercado";
import { setCors } from "../../shared/utils/express";

const webhooksApp = express()

setCors(webhooksApp, true)

webhooksApp.post("/mercado", verifyMercado, handleMercadoPaymentUpdate)

export default webhooksApp