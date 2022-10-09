import { format } from "date-fns"
import { formatCurrency } from "./formatCurrency"
import { logger } from "firebase-functions/v1"
import { sendgridClient } from "./sendgridClient"
import { constants as applePassConstants } from "@walletpass/pass-js"
import { generateTicketPass } from "./applePass/generateTicketPass"
import * as JSZip from "jszip"
import Environment from "../enums/Environment"

const fromEmail = "team@mercadopay.co"
const fromName = " Mercado Team"

const isProd = process.env.ENVIRONMENT === Environment.PROD

const templateIds = { 
  "TICKET_RECEIPT": isProd ? "d-4d034e3c47304ffa8e8446902e203216" : "d-152bff2074ed48bba71d4a549857ebf5", 
  "MENU_RECEIPT": isProd ? "d-a888fe1bc7ac4154a40f8a299cfb30fb" : "d-61abb274bd7b4627bae926ecb90a7d42", 
  "TICKET_SALE_ALERT": "d-8489d2902b1243e19dddc47012d78da5", 
  "EVENT_CHANGE": isProd ? "d-c3bb8586eedd4199b97fe59d75b741a2" : "d-d075ee17551e4f79938ed8b455d03aac", 
  "RETARGET": "d-f8e16f00ef83443eb5d7f294294a6f85", 
  "NEW_EVENT": "d-a150e261a7b845e7ba065e38fe86655f", 
  "MERCHANT_WELCOME": "d-4da5caa4421f48668602c5f807b6999c"
}

export enum TemplateName {
  TICKET_RECEIPT = "TICKET_RECEIPT",
  MENU_RECEIPT = "MENU_RECEIPT",
  INVITE = "INVITE",
  TICKET_SALE_ALERT = "TICKET_SALE_ALERT",
  NEW_EVENT = "NEW_EVENT",
  RETARGET = "RETARGET",
  EVENT_CHANGE = "EVENT_CHANGE",
  MERCHANT_WELCOME = "MERCHANT_WELCOME"
}

function addFees(productPrice, quantity, customerFee, currency) {
  const fee = formatCurrency(
    Math.round(productPrice * quantity * customerFee),
    currency
  )
  const total = formatCurrency(
    Math.round(productPrice * quantity * (1 + customerFee)),
    currency
  )
  return { fee, total }
}

export async function sendEmail(
  toEmails: Array<string>,
  templateName: TemplateName,
  data: unknown,
  attachmentData?: Array<{ content: string, filename: string, type: string, disposition: string }>,
) {
  const templateId = templateIds[templateName]

  logger.log("Sending email", {
    toEmails,
    fromEmail,
    data,
    templateId,
  })

  if(toEmails.length > 0){
    return sendgridClient().sendMultiple({
      to: toEmails,
      from: fromEmail,
      fromname: fromName,
      dynamic_template_data: data,
      template_id: templateId,
      attachments: attachmentData
    })  
  }
}

export async function sendMenuReceiptEmail(
  toEmail: string,
  merchantName: string,
  orderNumber: number,
  orderItems: any[],
  total: number,
  currency: string
) {
  const data = {
    merchantName,
    orderNumber,
    orderItems: orderItems.map((item) => {
      item.price = formatCurrency(item.price, currency)
      return item
    }),
    total: formatCurrency(total, currency),
  }

  logger.log("Sending menu receipt", {
    toEmail,
    data,
  })

  return sendEmail([toEmail], TemplateName.MENU_RECEIPT, data)
}

export async function sendInvites(
  inviteData: any[],
  inviterFirstName: string,
  organisationName: string
) {
  const personalisations = inviteData.map((datum) => {
    const { email, name, inviteId } = datum

    return {
      to: email,
      dynamic_template_data: {
        inviteId,
        organisationName,
        inviterFirstName,
        inviteeFirstName: name,
      },
    }
  })

  return sendgridClient().send({
    from: fromEmail,
    template_id: TemplateName.INVITE,
    personalisations,
  })
}

export async function sendTicketReceipt(
  merchant,
  event,
  product,
  user,
  quantity: number,
  ticketIds: string[],
  googlePassUrl: string
) {
  logger.log("Sending ticket receipt", {
    merchant,
    event,
    product,
    user
  })

  const { email: toEmail, firstName } = user
  const { displayName: merchantName, currency, customerFee } = merchant
  const { title: eventTitle, address } = event
  const { title: productTitle, price: productPrice, purchaserInfo } = product
  const boughtAt = new Date()

  const { fee, total } = addFees(productPrice, quantity, customerFee, currency)
  const tickets = ticketIds.map((ticketId, index) => {
    let ticketNumber = (index + 1).toString()

    while (ticketNumber.length < 3) {
      ticketNumber = "0" + ticketNumber
    }

    return {
      id: ticketId,
      productTitle,
      boughtAt: format(boughtAt, "HH:mm dd-MM-yy"),
      number: ticketNumber,
    }
  })

  const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${address
    .replace(/[^0-9a-z\s]/gi, "")
    .replace(" ", "+")}`

  const data = {
    firstName,
    merchantName,
    eventTitle,
    eventAddress: address,
    googleMapsLink,
    purchaserInfo,
    eventLink: `${process.env.CLIENT_URL}/events/${merchant.id}/${event.id}`,
    lineItems: [
      {
        productTitle,
        price: formatCurrency(productPrice, currency),
        quantity,
      },
    ],
    total,
    fee,
    tickets,
    googlePassUrl
  }

  const passBuffers = await Promise.all(ticketIds.map(ticketId => generateTicketPass(event, ticketId)))

  const attachmentData = passBuffers.map((buffer, index) => {
    return {
      content: buffer.toString("base64"),
      filename: `Apple Wallet ticket #${index + 1}.pkpass`,
      type: applePassConstants.PASS_MIME_TYPE,
      disposition: "attachment"
    }
  })

  if (passBuffers.length > 1) {
    const passStrings = passBuffers.map(buffer => buffer.toString("base64"))

    const zip = new JSZip()

    passStrings.forEach((passString, index) => {
      zip.file(`${index}.pkpass`, passString, { base64: true })
    })

    const passesBuffer = await zip.generateAsync({ type: "nodebuffer" })
    
    attachmentData.push({
      content: passesBuffer.toString("base64"),
      filename: "bundle.pkpasses",
      type: "application/vnd.apple.pkpasses",
      disposition: "attachment"
    })
  }

  return sendEmail([toEmail], TemplateName.TICKET_RECEIPT, data, attachmentData)
}

export async function sendTicketSaleAlert(
  toEmails: Array<string>,
  customerName: string,
  eventTitle: string,
  productTitle: string,
  productPrice: number,
  quantity: number,
  boughtAt: Date,
  currency: string,
  ticketIds: string[],
  customerFee: number
) {
  logger.log("Sending ticket sale alert", {
    toEmails,
    customerName,
    eventTitle,
    productTitle,
    productPrice,
    quantity,
    boughtAt,
    ticketIds,
  })
  const { fee, total } = addFees(productPrice, quantity, customerFee, currency)

  const data = {
    customerName,
    eventTitle,
    lineItems: [
      {
        productTitle,
        price: formatCurrency(productPrice, currency),
        quantity,
      },
    ],
    total,
    fee,
  }
  return sendEmail(toEmails, TemplateName.TICKET_SALE_ALERT, data)
}
