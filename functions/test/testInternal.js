
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

    it("testing 200 response from get status", (done) => {
    chai
        .request(process.env.BASE_URL )
        .get('/internal/status/')
        .end((err, res) => {
        expect(res).to.have.status(200);
        expect(err).to.be.null;
        done();
        });
    });

    it("testing 200 response from get bank", (done) => {
        chai
            .request(internalUrl)
            .get('/banks/GB')
            .end((err, res) => {
            expect(res).to.have.status(200);
            expect(err).to.be.null;
            done();
            });
        });
    it("testing 200 response from create link", (done) => {
        chai
            .request(internalUrl)
            .post('/links')
            .send(LINK_DATA)
            .end((err, res) => {
            expect(res).to.have.status(200);
            expect(err).to.be.null;
            done();            
            });
        });
}); 
