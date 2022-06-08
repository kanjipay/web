var chai = require("chai");
var chaiHttp = require("chai-http");
var expect = chai.expect;
chai.use(chaiHttp);
require('dotenv').config();

const internalUrl = process.env.BASE_URL + '/internal/api/v1';
const LINK_DATA = {
    path:'https://google.com',
    stateId: "123"
};

const CLIENT_DATA = {
    companyName:'MY_COMPANY'
};

describe("Internal Get requests", function() {
    it("testing 200 response from get status", function() {
    chai
        .request(internalUrl)
        .get('/status')
        .end(function (err, res) {
        expect(res).to.have.status(200);
        });
    });
    it("testing 200 response from get bank", function() {
        chai
            .request(internalUrl)
            .get('/banks')
            .end(function (err, res) {
            expect(res).to.have.status(200);
            });
        });
        it("testing 200 response from create link", function() {
            chai
                .request(internalUrl)
                .post('/links')
                .send(LINK_DATA)
                .end(function (err, res) {
                expect(res).to.have.status(200);
                });
            });
            it("testing 200 response from create client", function() {
                chai
                    .request(internalUrl)
                    .post('/clients')
                    .send(CLIENT_DATA)
                    .end(function (err, res) {
                    expect(res).to.have.status(200);
                    });
                });
});