/*
todo work out userId
import "mocha"
import { db } from "../../utils/admin";
import { api, expect } from "../../utils/server";
import Collection from "../../../src/shared/enums/Collection"
import { createEvent, createMerchant, createProduct } from "../../utils/generateTestData";
import { firestore } from "firebase-admin";
import { addHours } from "date-fns";
import { HttpStatusCode } from "../../../src/shared/utils/errors"
import { longFormat } from "../../../src/shared/utils/time"

describe("Create ticket", () => {
  const validTicketId = "valid-ticket"
  const incorrectEntryTimeTicketId = "incorrect-entry-time"
  const incorrectEventTicketId = "incorrect-event"
  const nonexistentEventTicketId = "nonexistant-event"
  const usedTicketId = "used"

  const merchantId = "test-create-ticket-merchant"
  const eventId = "test-create-ticket-event"
  const incorrectEventId = "test-create-ticket-incorrect-event"
  const productId = "test-create-ticket-product"
  const userId = "test-create-ticket-user"
  const orderId = "test-create-ticket-order"

  const defaultTicketData = {
    merchantId,
    eventId,
    productId,
    orderId,
    userId,
    createdAt: firestore.FieldValue.serverTimestamp(),
    wasUsed: false,
    eventEndsAt: addHours(new Date, 6),
  }

  const usedAt = addHours(new Date, -1)
  const earliestEntryAt = addHours(new Date, 1)

  function generateTicketCreationPromise(ticketId: string, ticketData: any = {}) {
    return db
      .collection(Collection.TICKET)
      .doc(ticketId)
      .create({
        ...defaultTicketData,
        ...ticketData
      })
  }

  before(async () => {
    await Promise.all([
      createMerchant(merchantId),
      createEvent(merchantId, eventId),
      createEvent(merchantId, incorrectEventId),
      createProduct(merchantId, eventId, productId),
      generateTicketCreationPromise(validTicketId),
      generateTicketCreationPromise(incorrectEntryTimeTicketId, { earliestEntryAt }),
      generateTicketCreationPromise(incorrectEventTicketId, { eventId: incorrectEventId }),
      generateTicketCreationPromise(nonexistentEventTicketId, { eventId: "nonexistent-id" }),
      generateTicketCreationPromise(usedTicketId, { wasUsed: true, usedAt }),
    ])
  })

  it("Should accept a valid ticket", async () => {
    const res = await api
      .post(`/merchants/m/${merchantId}/tickets/${validTicketId}/check`)
      .send({ eventId })
    
    expect(res.status).to.eql(200)
    expect(res.body).to.be.a("object")
    expect(res.body).to.include("event")

    const ticketDoc = await db.collection(Collection.TICKET).doc(validTicketId).get()

    expect(ticketDoc.exists).to.eql(true)
    expect(ticketDoc.data().wasUsed).to.eql(true)
    expect(ticketDoc.data()).to.include("usedAt")
  })

  it("Should not accept a ticket when the entry time is incorrect", async () => {
    const res = await api
      .post(`/merchants/m/${merchantId}/tickets/${incorrectEntryTimeTicketId}/check`)
      .send({ eventId })

    expect(res.status).to.eql(HttpStatusCode.BAD_REQUEST)
    expect(res.error.message).to.eql(`This ticket is only valid from ${longFormat(earliestEntryAt)}`)
  })

  it("Should not accept a ticket with an incorrect event id", async () => {
    const res = await api
      .post(`/merchants/m/${merchantId}/tickets/${incorrectEventTicketId}/check`)
      .send({ eventId })

    expect(res.status).to.eql(HttpStatusCode.BAD_REQUEST)
    expect(res.error.message).to.eql("This ticket is for another event")
  })

  it("Should not accept a ticket for a nonexistant event", async () => {
    const res = await api
      .post(`/merchants/m/${merchantId}/tickets/${nonexistentEventTicketId}/check`)
      .send({ eventId })

    expect(res.status).to.eql(HttpStatusCode.NOT_FOUND)
    expect(res.error.message).to.eql(`Event with id ${incorrectEventId} doesn't exist.`)
  })

  it("Should not accept a ticket that was already used", async () => {
    const res = await api
      .post(`/merchants/m/${merchantId}/tickets/${usedTicketId}/check`)
      .send({ eventId })

    expect(res.status).to.eql(HttpStatusCode.BAD_REQUEST)
    expect(res.error.message).to.eql(`This ticket was already used at ${longFormat(usedAt)}`)
  })

  after(async () => {
    const batch = db.batch()

    const deleteMap = {
      [Collection.MERCHANT]: [merchantId],
      [Collection.EVENT]: [eventId, incorrectEventId],
      [Collection.PRODUCT]: [productId],
      [Collection.TICKET]: [
        validTicketId,
        incorrectEntryTimeTicketId,
        incorrectEventTicketId,
        nonexistentEventTicketId,
        usedTicketId
      ]
    }

    for (const [collectionName, ids] of Object.entries(deleteMap)) {
      for (const id of ids) {
        const docRef = db.collection(collectionName).doc(id)
        batch.delete(docRef)
      }
    }

    await batch.commit()
  })
})
*/