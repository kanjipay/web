import { Template } from "@walletpass/pass-js"
import { logger } from "firebase-functions/v1"
import * as base64 from "base-64"

let cachedTemplate: Template

async function generateTemplate(): Promise<Template> {
  logger.log("Generating template")

  const template = new Template("eventTicket", {
    formatVersion: 1,
    passTypeIdentifier: "pass.com.mercadopay.passes.ticket",
    organizationName: "Mercado",
    logoText: "Mercado",
    teamIdentifier: "WS27NVRTBG",
    foregroundColor: "rgb(255, 255, 255)",
    backgroundColor: "rgb(60, 65, 76)",
  })

  logger.log("Initialised template", { template })

  await template.images.add("icon", `${__dirname}/icon.png`)
  await template.images.add("logo", `${__dirname}/logo.png`)

  const cert = base64.decode(process.env.APPLE_WALLET_CERT)
  const privateKey = base64.decode(process.env.APPLE_WALLET_PRIVATE_KEY)
  const password = process.env.APPLE_WALLET_PASSWORD

  template.setCertificate(cert)
  template.setPrivateKey(privateKey, password)

  return template
}

export async function ticketTemplate(): Promise<Template> {
  if (cachedTemplate) {
    return cachedTemplate
  } else {
    return await generateTemplate()
  }
}