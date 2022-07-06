import "mocha"
import { api, expect } from "../../utils/server"
import { createUserToken } from "../../utils/user"
import { db } from "../../utils/admin"
import Collection from "../../../src/shared/enums/Collection"
import { createProduct, createEvent } from "../../utils/generateTestData"

describe("Create Orders", () => {
  const userId = "oGvgPQWN4FdL9tBGO7HVeYhAEzl2" //olicairns93 in dev
  const merchantId = "trinity"
  const eventId = "orderTicketEvent"
  const productId = "orderTicketProduct"
  const orderData = {
    productId,
    quantity: 1,
    deviceId: "123",
  }
  before(async () => {
    await createProduct(merchantId, eventId, productId)
    await createEvent(merchantId, eventId)
  })

  it("Should create a valid order", (done) => {
    createUserToken(userId).then((userToken) => {
      api
        .post("/orders/tickets")
        .auth(userToken, { type: "bearer" })
        .send(orderData)
        .end(function (err, res) {
          expect(res).to.have.status(200)
          done()
        })
    })
  })
  after(async () => {
    await db.collection(Collection.PRODUCT).doc(productId).delete()
    await db.collection(Collection.EVENT).doc(eventId).delete()
    const TestOrders = await db
      .collection(Collection.ORDER)
      .where("deviceId", "==", "123")
      .get()
    TestOrders.forEach(
      async (order) =>
        await db.collection(Collection.ORDER).doc(order.id).delete()
    )
  })
})
