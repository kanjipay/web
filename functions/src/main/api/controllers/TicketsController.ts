import { firestore } from "firebase-admin"
import { fetchDocumentsInArray } from "../../../shared/utils/fetchDocumentsInArray"
import BaseController from "../../../shared/BaseController"
import Collection from "../../../shared/enums/Collection"
import { db } from "../../../shared/utils/admin"
import { dateFromTimestamp } from "../../../shared/utils/time"
import { fetchDocument } from "../../../shared/utils/fetchDocument"
import { Template, constants as applePassConstants } from "@walletpass/pass-js"
import { format } from "date-fns"
// import * as getRawBody from "raw-body"
import * as base64 from "base-64"
import { logger } from "firebase-functions/v1"

let cachedTemplate: Template

async function generateTemplate() {
  logger.log("Generating template")

  const template = new Template("eventTicket", {
    formatVersion: 1,
    passTypeIdentifier: "pass.com.mercadopay.passes.ticket",
    organizationName: "Mercado",
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

export class TicketsController extends BaseController {
  generateApplePass = async (req, res, next) => {
    try {
      const { ticketId } = req.params

      const { ticket, ticketError } = await fetchDocument(Collection.TICKET, ticketId)

      if (ticketError) {
        next(ticketError)
        return
      }

      logger.log("Got ticket", { ticket })

      const { event, eventError } = await fetchDocument(Collection.EVENT, ticket.eventId)

      if (eventError) {
        next(eventError)
        return
      }

      logger.log("Got event", { event })

      // const { title, photo, address, startsAt, endsAt, merchantId } = event
      const { title, address, startsAt, endsAt } = event

      let template: Template

      if (cachedTemplate) {
        logger.log("Template in cache, retrieving")
        template = cachedTemplate
      } else {
        const newTemplate = await generateTemplate()
        template = newTemplate
        cachedTemplate = newTemplate
      }

      logger.log("Got template", { template })

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

      logger.log("Created pass", { pass })

      // const bucket = storage().bucket()
      // const eventPhotoPath = `merchants/${merchantId}/events/${event.id}/${photo}`
      // const eventPhotoFile = bucket.file(eventPhotoPath)

      // logger.log("Retrieving event image for pass", { eventPhotoPath })

      // const eventPhotoBuffer = await getRawBody(eventPhotoFile.createReadStream())

      // logger.log("Retrieved photo")

      // await pass.images.add("thumbnail", eventPhotoBuffer)

      const passBuffer = await pass.asBuffer()

      logger.log("Transformed to buffer", passBuffer)

      res.set('content-type', applePassConstants.PASS_MIME_TYPE)
      res.status(200).send(passBuffer)
    } catch (err) {
      next(err)
    }
  }

  index = async (req, res, next) => {
    try {
      const userId = req.user.id

      const ticketSnapshot = await db()
        .collection(Collection.TICKET)
        .where("userId", "==", userId)
        .limit(1000)
        .get()

      const tickets = ticketSnapshot.docs.map((doc) => {
        const { eventId, productId, createdAt, hash } = doc.data()
        return { id: doc.id, eventId, productId, createdAt, hash }
      })

      if (tickets.length === 0) {
        return res.status(200).json({ events: [] })
      }

      const eventIds = [...new Set(tickets.map((t) => t.eventId))]
      const productIds = [...new Set(tickets.map((t) => t.productId))]

      const eventDocs = await fetchDocumentsInArray(
        db().collection(Collection.EVENT),
        firestore.FieldPath.documentId(),
        eventIds
      )

      const productDocs = await fetchDocumentsInArray(
        db().collection(Collection.PRODUCT),
        firestore.FieldPath.documentId(),
        productIds
      )

      const products = productDocs
        .map((doc) => {
          const productId = doc.id
          const { title, description, price, eventId, sortOrder, purchaserInfo } = doc
          const productTickets = tickets
            .filter((ticket) => ticket.productId === productId)
            .sort((ticket1, ticket2) => {
              if (!ticket1.createdAt) { 
                if (!ticket2.createdAt) {
                  return 0
                } else {
                  return -1 
                }
              } else if (!ticket2.createdAt) { 
                return 1
              }
              return dateFromTimestamp(ticket2.createdAt).getTime() - dateFromTimestamp(ticket1.createdAt).getTime()
            })

          return {
            id: productId,
            title,
            description,
            purchaserInfo,
            price,
            eventId,
            sortOrder,
            tickets: productTickets,
          }
        })
        .sort((product1, product2) => {
          return product2.sortOrder - product1.sortOrder
        })

      const events = eventDocs
        .map((doc) => {
          const eventId = doc.id
          const {
            address,
            title,
            description,
            startsAt,
            endsAt,
            photo,
            merchantId,
          } = doc
          const eventProducts = products.filter(
            (product) => product.eventId === eventId
          )
          return {
            id: eventId,
            address,
            title,
            description,
            startsAt,
            endsAt,
            photo,
            merchantId,
            products: eventProducts,
          }
        })
        .sort((event1, event2) => {
          return dateFromTimestamp(event1.startsAt) >
            dateFromTimestamp(event2.startsAt)
            ? -1
            : 1
        })

      return res.status(200).json({ events })
    } catch (err) {
      next(err)
    }
  }
}
