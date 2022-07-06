import { format } from "date-fns";
import { formatCurrency } from "./formatCurrency";
import LoggingController from "./loggingClient";
import { sendgridClient } from "./sendgridClient";

const fromEmail = "team@mercadopay.co";

enum TemplateName {
  TICKET_RECEIPT = "TICKET_RECEIPT",
  MENU_RECEIPT = "MENU_RECEIPT",
  INVITE = "INVITE",
}

async function sendEmail(
  toEmail: string,
  templateName: TemplateName,
  data: unknown
) {
  const logger = new LoggingController("sendEmail")
  const templateIds = JSON.parse(process.env.TEMPLATE_IDS)

  const templateId = templateIds[templateName];

  logger.log("Sending email", {
    toEmail,
    fromEmail,
    data,
    templateId,
  })

  return sendgridClient().send({
    to: toEmail,
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
  const logger = new LoggingController("sendMenuReceipt");

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

  return sendEmail(toEmail, TemplateName.MENU_RECEIPT, data);
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
  eventTitle: string,
  productTitle: string,
  productPrice: number,
  quantity: number,
  boughtAt: Date,
  currency: string,
  ticketIds: string[],
  customerFee: number
) {
  const logger = new LoggingController("sendTicketReceipt");

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

  const fee = formatCurrency(
    Math.round(productPrice * quantity * customerFee),
    currency
  )
  const total = formatCurrency(
    Math.round(productPrice * quantity * (1 + customerFee)),
    currency
  )

  const tickets = ticketIds.map((ticketId, index) => {
    let ticketNumber = (index + 1).toString();

    while (ticketNumber.length < 3) {
      ticketNumber = "0" + ticketNumber;
    }

    return {
      id: ticketId,
      productTitle,
      boughtAt: format(boughtAt, "HH:mm dd-MM-yy"),
      number: ticketNumber,
    }
  })

  const data = {
    firstName,
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
    tickets,
  }

  return sendEmail(toEmail, TemplateName.TICKET_RECEIPT, data)
}
