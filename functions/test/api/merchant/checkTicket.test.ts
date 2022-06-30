import "mocha"
import { api, expect } from "../../utils/server";

import { db } from "../../utils/admin";
import Collection from "../../../src/shared/enums/Collection"

import { createMerchant, createMembership, createTicket, createEvent, createProduct} from "../../utils/generateTestData";
import {createUserToken} from "../../utils/user";


describe("Check tickets", () => {
    const merchantId = "test-check-ticket-userid";
    const membershipId = 'test-crezco-membershipid';
    const userId = 'oGvgPQWN4FdL9tBGO7HVeYhAEzl2'; //olicairns93 in dev
    const ticketId = 'testTicketCheckTicketId';
    const eventId = 'testEvent';
    const productId = '1234';

    before(async () => {
        await createTicket(ticketId, userId, eventId,merchantId);
        await createMerchant(merchantId);
        await createEvent(merchantId, eventId);
        await createMembership(merchantId, userId, membershipId);
        await createProduct(merchantId, eventId, productId);
    });
    it("Should accept valid ticket", async () => {
        const userToken = await createUserToken(userId);
        const res = await api.post(`/merchants/m/${merchantId}/tickets/${ticketId}/check`)
            .auth(userToken, { type: 'bearer' })
            .send({eventId});
        expect(res).to.have.status(200);
    }) 
    
    after(async () => {
        const batch = db.batch();
        db.collection(Collection.MERCHANT).doc(merchantId).delete();
        db.collection(Collection.MEMBERSHIP).doc(membershipId).delete();
        db.collection(Collection.TICKET).doc(ticketId).delete();
        db.collection(Collection.EVENT).doc(eventId).delete();
        db.collection(Collection.PRODUCT).doc(productId).delete();
        await batch.commit();
        });
});