import "mocha"
import { api, expect } from "../../utils/server"
import { createUserToken } from "../../utils/user"

describe("Create Orders", () => {
  const userId = "oGvgPQWN4FdL9tBGO7HVeYhAEzl2" //olicairns93 in dev

  const orderData = {
    productId: "D51lxz9qXNiXRx9FlXaE",
    quantity: 1,
    deviceId: "123",
  }

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
})
