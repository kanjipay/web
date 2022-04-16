import * as express from "express";
import { checkMoneyhubIp } from "./checkMoneyhubIp";
import { handleMoneyhubPaymentUpdate } from "./handleMoneyhubPaymentUpdate";

const v1App = express();

v1App.post("/moneyhub", checkMoneyhubIp, handleMoneyhubPaymentUpdate);

export default v1App;
