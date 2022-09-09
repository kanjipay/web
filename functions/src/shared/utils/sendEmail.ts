import { format } from "date-fns"
import { formatCurrency } from "./formatCurrency"
import { logger } from "firebase-functions/v1"
import { sendgridClient } from "./sendgridClient"
import { constants as applePassConstants } from "@walletpass/pass-js"
import { generateTicketPass } from "./applePass/generateTicketPass"
import * as JSZip from "jszip"

const fromEmail = "team@mercadopay.co"
const fromName = " Mercado Team"

export enum TemplateName {
  TICKET_RECEIPT = "TICKET_RECEIPT",
  MENU_RECEIPT = "MENU_RECEIPT",
  INVITE = "INVITE",
  TICKET_SALE_ALERT = "TICKET_SALE_ALERT",
  NEW_EVENT = "NEW_EVENT",
  RETARGET = "RETARGET",
  EVENT_CHANGE = "EVENT_CHANGE"
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
  const templateIds = JSON.parse(process.env.TEMPLATE_IDS)

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
      filename: `${index}.pkpass`,
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
