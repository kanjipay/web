import { format } from "date-fns";
import { dateFromTimestamp } from "../time";
import { ticketTemplate } from "./ticketTemplate";
import { constants as applePassConstants, Pass } from "@walletpass/pass-js"

export async function generateTicketPass(event: any, ticketId: string): Promise<Pass> {
  const template = await ticketTemplate()

  const { title, address, startsAt, endsAt } = event

  const startDate = dateFromTimestamp(startsAt)
  const startDateString = format(startDate, "yyyy-MM-dd")
  const startTimeString = format(startDate, "HH:mm")
  const endTimeString = format(dateFromTimestamp(endsAt), "HH:mm")
  const relevantDate = `${startDateString}T${startTimeString}-${endTimeString}`

  const pass = template.createPass({
    relevantDate,
    description: event.title,
    serialNumber: ticketId,
    eventTicket: {
      primaryFields: [
        {
          key: "event",
          label: "Event",
          value: title
        }
      ],
      secondaryFields: [
        {
          key: "loc",
          label: "Location",
          value: address
        },
      ]
    },
    barcode: {
      message: ticketId,
      format: applePassConstants.barcodeFormat.QR,
      messageEncoding: "iso-8859-1"
    }
  })

  return pass
}