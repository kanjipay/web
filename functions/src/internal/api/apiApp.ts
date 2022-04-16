import * as express from "express";
import * as cors from "cors";
import v1App from "./v1/v1App";
// import { checkFirebaseAuthToken } from '../../../shared/middleware/auth'
import { verifyDomain } from "../../shared/middleware/verifyDomain";

const apiApp = express();

const origin = process.env.ENVIRONMENT === "DEV" ? "*" : process.env.CLIENT_URL;
const corsInstanceApi = cors({ origin });
apiApp.use(corsInstanceApi);
apiApp.options("*", corsInstanceApi);

apiApp.use("/v1", verifyDomain, v1App)

// Do this to enable protected routes
// app.use('/orders', checkFirebaseAuthToken, ordersRoutes)

export default apiApp;
