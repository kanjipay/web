import "mocha";
import { api, expect } from "../../utils/server";
import { createTicketOrder } from "../../utils/generateTestData";

import { db } from "../../utils/admin";
import Collection from "../../../src/shared/enums/Collection";

describe("Payment attempts", () => {
  const orderIdCrezco = "test-get-payment-attempt-order-crez";
  const orderIdStripe = "test-get-payment-attempt-order-str";
  const merchantId = "trinity";
  const paymentAttemptStripeData = { orderId: orderIdCrezco, deviceId: "123" };
  const paymentAttemptCrezcoData = {
    orderId: orderIdStripe,
    crezcoBankCode: "mock-payments-gb-redirect",
    countryCode: "GB",
    deviceId: "123",
  };
  before(async () => {
    await createTicketOrder(orderIdCrezco, 100, merchantId);
    await createTicketOrder(orderIdStripe, 100, merchantId);
  });
  it("Create crezco payment", (done) => {
    api
      .post("/payment-attempts/crezco")
      .send(paymentAttemptCrezcoData)
      .end(function (err, res) {
        expect(res).to.have.status(200);
        done();
      });
  });
  it("Create stripe payment", (done) => {
    api
      .post("/payment-attempts/stripe")
      .send(paymentAttemptStripeData)
      .end(function (err, res) {
        expect(res).to.have.status(200);
        done();
      });
  });
  after(async () => {
    await db.collection(Collection.ORDER).doc(orderIdCrezco).delete();
    await db.collection(Collection.ORDER).doc(orderIdStripe).delete();
  });
});
