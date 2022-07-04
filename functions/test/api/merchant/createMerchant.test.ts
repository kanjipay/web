import "mocha"
import { api, expect } from "../../utils/server";
import {createUserToken} from "../../utils/user";
import { db } from "../../utils/admin";
import Collection from "../../../src/shared/enums/Collection"

describe("Create merchant", () => {
    const userId = 'Sf9VnvaTxmWm2DECrHg6a7mlV6I3' //matt ffrench in dev
    const merchantData = {
        accountNumber: "00000000", 
        address: "8B Mitchison road", 
        companyName: "TEST", 
        displayName: "TEST", 
        sortCode: "000000", 
        description: "test", 
        photo:"photo"
    }
  before(async () => {
  });  
  it("Should create a valid merchant", async () => {
    const userToken = await createUserToken(userId)
    const res = await api.post('/merchants/create')
        .auth(userToken, { type: 'bearer' })
        .send(merchantData)
    expect(res).to.have.status(200);
    const {merchantId} = res.body;
    expect(merchantId).to.not.be.undefined;
    const merchantDoc = await db.collection(Collection.MERCHANT).doc(merchantId).get();
    expect(merchantDoc.exists).to.equal(true)
    expect(merchantDoc.data().accountNumber).to.equal("00000000")
    expect(merchantDoc.data().address).to.equal("8B Mitchison road")
    const membershipDocs = await db.collection(Collection.MEMBERSHIP).where("merchantId", "==", merchantId).get();
    const membership = membershipDocs.docs[0];
    expect(membership.data().userId).to.equal(userId);
  })
});

