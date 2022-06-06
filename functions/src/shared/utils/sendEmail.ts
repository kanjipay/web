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

  const tickets = ticketIds.map(ticketId => {
    return {
      id: ticketId,
      productTitle,
      boughtAt: format(boughtAt, "HH:mm dd-MM-yy")
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