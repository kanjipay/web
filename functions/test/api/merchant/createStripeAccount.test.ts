
import "mocha"
import { db } from "../../utils/admin";
import { api, expect } from "../../utils/server";
import Collection from "../../../src/shared/enums/Collection"
import { createMerchant, createMembership} from "../../utils/generateTestData";
import {createUserToken} from "../../utils/user";


describe("Test Stripe account linking", () => {
    const merchantId = "test-stripe-userid";
    const membershipId = 'test-stripe-membershipid';
    const userId = 'oGvgPQWN4FdL9tBGO7HVeYhAEzl2' //olicairns93 in dev
    before(async () => {
        await createMerchant(merchantId, {addCrezcoId: false});
        await createMembership(merchantId, userId, membershipId);
    });
    it("Should update crezco id", async () => {
        const userToken = await createUserToken(userId);
        const res = await api.post(`/merchants/m/${merchantId}/create-stripe-account-link`)
            .auth(userToken, { type: 'bearer' })
        const merchantDoc = await db.collection(Collection.MERCHANT).doc(merchantId).get()
        expect(res).to.have.status(200);
        expect(merchantDoc.exists).to.eql(true);
        expect(merchantDoc.data().stripe.accountId).to.not.be.null;
    })
    after(async () => {
        await db.collection(Collection.MERCHANT).doc(merchantId).delete();
        await db.collection(Collection.MEMBERSHIP).doc(membershipId).delete();
        });
});