import * as express from "express"
import { setCors } from "../../shared/utils/express"
import banksRoutes from "./routes/banksRoutes"
import linksRoutes from "./routes/linksRoutes"
import merchantsRoutes from "./routes/merchantsRoutes"
import ordersRoutes from "./routes/ordersRoutes"
import paymentAttemptsRoutes from "./routes/paymentAttemptsRoutes"
import ticketsRoutes from "./routes/ticketsRoutes"
import * as userAgent from "express-useragent"
import { createAirtableProspect } from "./createAirtableProspect"

const mainApiApp = express()

setCors(mainApiApp)

mainApiApp.use(userAgent.express())

mainApiApp.use("/banks", banksRoutes)
mainApiApp.use("/links", linksRoutes)
mainApiApp.use("/merchants", merchantsRoutes)
mainApiApp.use("/tickets", ticketsRoutes)
mainApiApp.use("/orders", ordersRoutes)
mainApiApp.use("/payment-attempts", paymentAttemptsRoutes)

mainApiApp.post("/airtable", createAirtableProspect)

export default mainApiApp
