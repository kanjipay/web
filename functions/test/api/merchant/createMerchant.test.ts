/*
import "mocha"
import { api, expect } from "../../utils/server";
import { createUser } from "../../utils/generateTestData";
import { db } from "../../utils/admin";
import {createUserToken} from "../../utils/user";
import Collection from "../../../src/shared/enums/Collection";
import {Blob} from "buffer";

function createImgAsFile(){
    var blob = new Blob([""], { type: 'jpg' });
    blob["lastModifiedDate"] = "";
    blob["name"] = "filename";
    return blob;
}


describe("Create merchant", () => {
  const userId = 'test123';
  const merchantId = 'test-merchant';
  const merchantData = {
    accountNumber: "00000000", 
    address: "8B Mitchison road", 
    companyName: "TEST", 
    displayName: "TEST", 
    sortCode: "000000", 
    description: "test", 
    imageAsFile:createImgAsFile()
  }
  before(async () => {
    createUser(userId);
  });  
  it("Should create a valid merchant", (done) => {
    createUserToken(userId).then((userToken) => {
        api.post('/merchants/create')
        .set("Authorization",`Bearer ${userToken}`)
        .set('user.id',userId)
        .send(merchantData)
        .end(function(err, res) {
          expect(res).to.have.status(200);
          done();
          })      
        });
    })
  after(async () => {
    const batch = db.batch();
    batch.delete(db.collection(Collection.USER).doc(userId));
    batch.delete(db.collection(Collection.MERCHANT).doc(merchantId));
    await batch.commit();
  });
});
*/