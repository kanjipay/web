import { dateFromTimestamp } from "../time";
import { ticketTemplate } from "./ticketTemplate";
import { constants as applePassConstants } from "@walletpass/pass-js"
// import { storage } from "firebase-admin";
// import * as gm from "gm"

export async function generateTicketPass(event: any, ticketId: string, eventImageBuffer?: Buffer): Promise<Buffer> {
  const template = await ticketTemplate()

  const { title, address, endsAt } = event

  const pass = template.createPass({
    relevantDate: dateFromTimestamp(endsAt),
    description: event.title,
    serialNumber: ticketId,
    groupingIdentifier: event.id,
    eventTicket: {
      primaryFields: [
        {
          key: "event",
          label: "Event",
          value: title
        },
      ],
      secondaryFields: [
        {
          key: "loc",
          label: "Location",
          value: address
        },
      ],
      auxiliaryFields: [
        {
          key: "startsAt",
          label: "Starts",
          value: dateFromTimestamp(event.startsAt),
          dateStyle: "PKDateStyleLong",
          timeStyle: "PKDateStyleLong"
        },
        {
          key: "endsAt",
          label: "Ends",
          value: dateFromTimestamp(event.endsAt),
          dateStyle: "PKDateStyleLong",
          timeStyle: "PKDateStyleLong"
        }
      ]
    },
    barcodes: [{
      message: ticketId,
      format: applePassConstants.barcodeFormat.QR,
      messageEncoding: "iso-8859-1",
      altText: ticketId
    }]
  })

  if (eventImageBuffer) {
    await pass.images.add("strip", eventImageBuffer)
  }

  return await pass.asBuffer()
}

