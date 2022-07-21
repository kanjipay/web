import { format } from "date-fns"
import { formatCurrency } from "./formatCurrency"
import { logger } from "firebase-functions/v1"
import { sendgridClient } from "./sendgridClient"

const fromEmail = "team@mercadopay.co"

enum TemplateName {
  TICKET_RECEIPT = "TICKET_RECEIPT",
  MENU_RECEIPT = "MENU_RECEIPT",
  INVITE = "INVITE",
  TICKET_SALE_ALERT = "TICKET_SALE_ALERT",
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
  data: unknown
) {
  const templateIds = JSON.parse(process.env.TEMPLATE_IDS)

  const templateId = templateIds[templateName]

  logger.log("Sending email", {
    toEmails,
    fromEmail,
    data,
    templateId,
  })

  return sendgridClient().send({
    to: toEmails,
    from: fromEmail,
    dynamic_template_data: data,
    template_id: templateId,
  })
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
  toEmail: string,
  firstName: string,
  merchantName: string,
  eventTitle: string,
  eventAddress: string,
  eventStartsAt: Date,
  eventEndsAt: Date,
  productTitle: string,
  productPrice: number,
  quantity: number,
  boughtAt: Date,
  currency: string,
  ticketIds: string[],
  customerFee: number,
) {
  logger.log("Sending ticket receipt", {
    toEmail,
    firstName,
    eventTitle,
    productTitle,
    productPrice,
    quantity,
    boughtAt,
    ticketIds,
  })
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

  const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${eventAddress
    .replace(/[^0-9a-z\s]/gi, "")
    .replace(" ", "+")}`

  const data = {
    firstName,
    merchantName,
    eventTitle,
    eventAddress,
    googleMapsLink,
    eventStartsAt: format(eventStartsAt, "do MMM HH:mm"),
    eventEndsAt: format(eventEndsAt, "do MMM HH:mm"),
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
  }
  return sendEmail([toEmail], TemplateName.TICKET_RECEIPT, data)
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
