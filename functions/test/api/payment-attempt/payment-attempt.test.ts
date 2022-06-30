
import "mocha"
import { api, expect } from "../../utils/server";
import { createMerchant, createTicketOrder } from "../../utils/generateTestData";

import { db } from "../../utils/admin";
import Collection from "../../../src/shared/enums/Collection";

describe("Payment attempts", () => {
  const orderId = 'test-get-payment-attempt-order';
  const merchantId = 'test-merchant';
  const paymentAttemptData = {orderId,
                            crezcoBankCode:'mock-payments-gb-redirect', 
                            countryCode :'GB', 
                            deviceId:'123'};
  before(async () => {
     createTicketOrder(orderId, 100, merchantId);
     createMerchant(merchantId);
  });  
  it("Create crezco payment",  (done) => {
        api.post('/payment-attempts/crezco')
           .send(paymentAttemptData)
           .end(function(err, res) {
            expect(res).to.have.status(200);
            done();
        });
    })
  after(async () => {
    db.collection(Collection.ORDER).doc(orderId).delete();
    db.collection(Collection.MERCHANT).doc(merchantId).delete();
  });
});
