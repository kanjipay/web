/*
var chai = require("chai");
var chaiHttp = require("chai-http");
var expect = chai.expect;
var buffer =require('buffer');
chai.use(chaiHttp);
require('dotenv').config();
const axios = require('axios').default;
const admin = require('firebase-admin');
admin.initializeApp();
const onlineMenuUrl = process.env.BASE_URL + '/onlineMenu/v1';


const createIdTokenfromCustomToken = async uid => {
  try {
    const customToken = await admin.auth().createCustomToken(uid);

    const res = await axios({
      url: `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyCustomToken?key=${firebaseApiKey}`,
      method: 'post',
      data: {
        token: customToken,
        returnSecureToken: true
      },
      json: true,
    });

    return res.data.idToken;

  } catch (e) {
    console.log(e);
  }
}

const token = createIdTokenfromCustomToken('test-uid')
token.then(value => {console.log(value)})

function createImgAsFile(){
    var blob = new buffer.Blob([""], { type: 'jpg' });
    blob["lastModifiedDate"] = "";
    blob["name"] = "filename";
    return blob;
}

const MERCHANT_DATA =  {
        accountNumber: "00000000", 
        address: "8B Mitchison road", 
        companyName: "TEST", 
        displayName: "TEST", 
        sortCode: "000000", 
        description: "test", 
        imageAsFile:createImgAsFile()
    }

describe("Internal Get requests", function() {
    it("testing create merchant", async function() {
        console.log(MERCHANT_DATA);
        chai
            .request(onlineMenuUrl)
            .post('/merchants/create')
            .set("Authorization",`Bearer ${idToken}`)
            .set('user.id','ordVegkMwqPyfuhigzBdKxcfKow1')
            .send(MERCHANT_DATA)
            .end(function (err, res) {
            expect(res).to.have.status(200);
            });
        });
});
*/
