import { format } from "date-fns"
import { formatCurrency } from "./formatCurrency"
import LoggingController from "./loggingClient"
import { sendgridClient } from "./sendgrid"

const fromEmail = "team@mercadopay.co"

enum TemplateId {
  TICKET_RECEIPT = "d-4d034e3c47304ffa8e8446902e203216",
  MENU_RECEIPT = "d-a888fe1bc7ac4154a40f8a299cfb30fb"
}

async function sendEmail(toEmail: string, templateId: TemplateId, data: unknown) {
  const logger = new LoggingController("sendEmail")

  logger.log("Sending email", {
    toEmail,
    fromEmail,
    data,
    templateId
  })

  return sendgridClient().send({
    to: toEmail,
    from: fromEmail,
    dynamic_template_data: data,
    template_id: templateId
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
  const logger = new LoggingController("sendMenuReceipt")

  const data = {
    merchantName,
    orderNumber,
    orderItems: orderItems.map(item => {
      item.price = formatCurrency(item.price, currency)
      return item
    }),
    total: formatCurrency(total, currency)
  }

  logger.log("Sending menu receipt", {
    toEmail,
    data
  })

  return sendEmail(toEmail, TemplateId.MENU_RECEIPT, data)
}

export async function sendTicketReceipt(
  toEmail: string, 
  firstName: string,
  eventTitle: string,
  productTitle: string, 
  productPrice: number, 
  quantity: number,
  boughtAt: Date,
  currency: string,
  ticketIds: string[]
) {
  const logger = new LoggingController("sendTicketReceipt")

  logger.log("Sending ticket receipt", {
    toEmail,
    firstName,
    eventTitle,
    productTitle,
    productPrice,
    quantity,
    boughtAt,
    ticketIds
  })

  const total = formatCurrency(productPrice * quantity, currency)

  const tickets = ticketIds.map((ticketId, index) => {
    let ticketNumber = (index + 1).toString()

    while (ticketNumber.length < 3) {
      ticketNumber = "0" + ticketNumber
    }

    return {
      id: ticketId,
      productTitle,
      boughtAt: format(boughtAt, "HH:mm dd-MM-yy"),
      number: ticketNumber
    }
  })

  const data = {
    firstName,
    eventTitle,
    lineItems: [
      {
        productTitle,
        price: formatCurrency(productPrice, currency),
        quantity
      }
    ],
    total,
    tickets
  }

  return sendEmail(toEmail, TemplateId.TICKET_RECEIPT, data)
}