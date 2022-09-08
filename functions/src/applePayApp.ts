import * as express from "express"
import { setCors } from "./shared/utils/express"

const applePayApp = express()
setCors(applePayApp, true)

applePayApp.get("/.well-known/apple-developer-merchantid-domain-association.txt", (req, res) => {
  return res.status(200).send(process.env.APPLE_PAY_VERIFICATION)
})

export default applePayApp