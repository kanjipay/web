
var chai = require("chai");
var chaiHttp = require("chai-http");
var expect = chai.expect;
chai.use(chaiHttp);
require('dotenv').config();

const internalUrl = process.env.BASE_URL + '/internal/api/v1';


const CLIENT_DATA = {
    companyName:'MY_COMPANY'
};

describe("Internal Get requests", function() {

    it("testing 200 response from create link", (done) => {
        chai
            .request(internalUrl)
            .end((err, res) => {
            expect(res).to.have.status(200);
            expect(err).to.be.null;
            done();            
            });
        });
}); 
