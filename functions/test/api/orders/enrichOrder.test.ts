import "mocha"
import { db } from "../../utils/admin";
import { api, expect } from "../../utils/server";
import Collection from "../../../src/shared/enums/Collection"
import { createMerchant, createMembership, createTicketOrder} from "../../utils/generateTestData";
import {createUserToken} from "../../utils/user";


describe("Enrich order data", () => {
    const merchantId = "test-enrich-order-mer";
    const membershipId = 'test-enrich-order-mem';

    const orderId = 'test-enrich-order-or';
    const userId = 'oGvgPQWN4FdL9tBGO7HVeYhAEzl2' //olicairns93 in dev
    before(async () => {
        await createMerchant(merchantId, {addCrezcoId: false});
        await createMembership(merchantId, userId, membershipId);
        await createTicketOrder(orderId, 10, merchantId);
    });
    it("Should enrich created order", async () => {
        const userToken = await createUserToken(userId);
        const res = await api.put(`/orders/o/${orderId}/enrich`).auth(userToken, { type: 'bearer' })
        const orderDoc = await db.collection(Collection.ORDER).doc(orderId).get();
        expect(res).to.have.status(200);
        expect(orderDoc.exists).to.eql(true);
        expect(orderDoc.data().sessionData).to.not.be.null;    
    }) 
    
    after(async () => {
        await db.collection(Collection.MERCHANT).doc(merchantId).delete();
        await db.collection(Collection.MEMBERSHIP).doc(membershipId).delete();
        await db.collection(Collection.ORDER).doc(orderId).delete();
        });
});