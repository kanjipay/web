var chai = require("chai");
var chaiHttp = require("chai-http");
var expect = chai.expect;
chai.use(chaiHttp);
require('dotenv').config();

const clientUrl = process.env.BASE_URL + '/clientApi/v1';
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

const PAYEE_DATA = {companyName: 'myCompany',
companyNumber: '12345678',
sortCode: '000000',
accountNumber: '12345678',
address: 'flat 2, 20 lamb street'}

describe("Payees Tests", function() {
    describe("Get Payees", function() {
      it("testing 200 response", function() {
        chai
          .request(clientUrl)
          .get('/payees')
          .set('mcp-client-id', clientId)
          .set('mcp-client-secret', clientSecret)
          .end(function (err, res) {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
         });
      });
    });
  
    describe("Create Payee", function() {
      it("testing 200 response", function() {
        chai
          .request(clientUrl)
          .post('/payees')
          .set('mcp-client-id', clientId)
          .set('mcp-client-secret', clientSecret)
          .send(PAYEE_DATA)
          .end(function (err, res) {
            expect(res).to.have.status(200);
            const {payeeId} = res.body;
         });
      });
    });
});
