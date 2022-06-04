var chai = require("chai");
var chaiHttp = require("chai-http");
var expect = chai.expect;
chai.use(chaiHttp);
require('dotenv').config();

const internalUrl = process.env.BASE_URL + '/internal/api/v1';

describe("Internal Healthcheck", function() {
    it("testing 200 response", function() {
    chai
        .request(internalUrl)
        .get('/status')
        .end(function (err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        });
    });
});