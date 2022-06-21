/*
var chai = require("chai");
var chaiHttp = require("chai-http");
var expect = chai.expect;
chai.use(chaiHttp);
require('dotenv').config();

const clientUrl = process.env.BASE_URL + '/clientApi/v1';
const internalUrl = process.env.BASE_URL + '/internal/api/v1';
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

//need to seed the TEST merchant in the env
const PAYMENT_INTENT_DATA = {
  "amount": 100, 
            "successUrl": "https://google.com", 
            "cancelledUrl": "https://google.com",
  "payeeId": "TEST"
}


describe("Payment Tests", function() {
    describe("Create Payment Intent then Crezco Payment Attempt", function(done) {
      it("testing 200 response", function() {
        chai
          .request(clientUrl)
          .post('/payment-intents')
          .set('mcp-client-id', clientId)
          .set('mcp-client-secret', clientSecret)
          .send(PAYMENT_INTENT_DATA)
          .end(function (err, res) {
            expect(res).to.have.status(200);
            const {paymentIntentId} = res.body;
            chai
            .request(internalUrl)
            .post('/payment-attempts/crezco')
            .send(
              {
                paymentIntentId, 
                crezcoBankCode: 'mock-payments-gb-redirect',
                 deviceId:'abc123'
              }
            )
            .end(function (err, res) {
              expect(res).to.have.status(200);
              done();            

            })
         });
      });
    });
}); 
*/