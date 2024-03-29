import "mocha"
import { api, expect } from "../../utils/server"

import { db } from "../../utils/admin"
import Collection from "../../../src/shared/enums/Collection"

import {
  createMerchant,
  createMembership,
  createTicket,
  createEvent,
  createProduct,
} from "../../utils/generateTestData"
import { createUserToken } from "../../utils/user"

describe("Check tickets", () => {
  const merchantId = "test-check-ticket-userid"
  const membershipId = "test-crezco-membershipid"
  const userId = "oGvgPQWN4FdL9tBGO7HVeYhAEzl2" //olicairns93 in dev
  const validTicketId = "testTicketCheckTicketId"
  const nonExistentEventTicket = "nonExistentEventTicket"
  const otherMerchantEventTicket = "otherMerchantEventTicket"
  const eventId = "testEvent"
  const otherMerchantEventId = "otherMerchantEvent"
  const productId = "1234"

  before(async () => {
    await createTicket(validTicketId, userId, eventId, merchantId)
    await createTicket(
      nonExistentEventTicket,
      userId,
      "nonExistentEvent",
      merchantId
    )
    await createTicket(
      otherMerchantEventTicket,
      userId,
      otherMerchantEventId,
      "otherMerchant"
    )
    await createMerchant(merchantId)
    await createEvent(merchantId, eventId)
    await createEvent("otherMerchant", otherMerchantEventId)
    await createMembership(merchantId, userId, membershipId)
    await createProduct(merchantId, eventId, productId)
  })
  it("Should accept valid ticket", async () => {
    const userToken = await createUserToken(userId)
    const res = await api
      .post(`/merchants/m/${merchantId}/tickets/${validTicketId}/check`)
      .auth(userToken, { type: "bearer" })
      .send({ eventId })
    expect(res).to.have.status(200)
  })
  it("Should reject nonexistent event id", async () => {
    const userToken = await createUserToken(userId)
    const res = await api
      .post(
        `/merchants/m/${merchantId}/tickets/${nonExistentEventTicket}/check`
      )
      .auth(userToken, { type: "bearer" })
      .send({ eventId })
    expect(res).to.have.status(400)
  })

  it("Should reject ticket for other merchantt", async () => {
    const userToken = await createUserToken(userId)
    const res = await api
      .post(
        `/merchants/m/${merchantId}/tickets/${otherMerchantEventTicket}/check`
      )
      .auth(userToken, { type: "bearer" })
      .send({ eventId })
    expect(res).to.have.status(400)
  })

  after(async () => {
    const batch = db.batch()
    db.collection(Collection.MERCHANT).doc(merchantId).delete()
    db.collection(Collection.MEMBERSHIP).doc(membershipId).delete()
    db.collection(Collection.TICKET).doc(validTicketId).delete()
    db.collection(Collection.TICKET).doc(nonExistentEventTicket).delete()
    db.collection(Collection.TICKET).doc(otherMerchantEventTicket).delete()
    db.collection(Collection.EVENT).doc(eventId).delete()
    db.collection(Collection.EVENT).doc(otherMerchantEventId).delete()
    db.collection(Collection.PRODUCT).doc(productId).delete()
    await batch.commit()
  })
})
