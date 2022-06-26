/*
import "mocha"
import { db } from "../../utils/admin";
import { api, expect } from "../../utils/server";
import Collection from "../../../src/shared/enums/Collection"
import { createMerchant } from "../../utils/generateTestData";


describe("Add Crezco UserId", () => {
    const MERCHANT_ID = "test-add-crezco-userid";
    const crezcoUserId = "test-crezco-userid";
    before(async () => {
        await createMerchant(MERCHANT_ID, {addCrezcoId: false})
    });
    it("Should accept a valid ticket", async () => {
        const res = await api
          .post('TODO')
          .send({ crezcoUserId })
        
        expect(res.status).to.eql(200)
        expect(res.body).to.be.a("object")
        expect(res.body).to.include("event")
    
        const merchantDoc = await db.collection(Collection.MERCHANT).doc(MERCHANT_ID).get()
    
        expect(merchantDoc.exists).to.eql(true)
        expect(merchantDoc.data().crezco.userId).to.eql(crezcoUserId)
      })

});
*/