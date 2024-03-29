import "mocha"
import { api, expect } from "../../utils/server"
import { createTicket, createEvent } from "../../utils/generateTestData"
import { db } from "../../utils/admin"
import { createUserToken } from "../../utils/user"
import Collection from "../../../src/shared/enums/Collection"

describe("Get tickets", () => {
  const userId = "oGvgPQWN4FdL9tBGO7HVeYhAEzl2" //olicairns93 in dev;
  const eventId = "test-get-ticket-event"
  const ticketId = "test-get-ticket-ticket2"
  before(async () => {
    await Promise.all([
      createEvent("test-merchant", eventId),
      createTicket(ticketId, userId, eventId, "123"),
    ])
  })
  it("Should get user's tickets", (done) => {
    createUserToken(userId).then((userToken) => {
      api
        .get("/tickets")
        .auth(userToken, { type: "bearer" })
        .end(function (err, res) {
          expect(res).to.have.status(200)
          const eventIds = res.body.events.map((e) => e.id)
          expect(eventIds).to.include(eventId)
          done()
        })
    })
  })
  after(async () => {
    await db.collection(Collection.TICKET).doc(ticketId).delete()
    await db.collection(Collection.EVENT).doc(eventId).delete()
  })
})
