import "mocha";
import { api, expect } from "../../utils/server";

import { db } from "../../utils/admin";
import Collection from "../../../src/shared/enums/Collection";

import { createMerchant, createMembership } from "../../utils/generateTestData";
import { createUserToken } from "../../utils/user";

describe("Get users", () => {
  const merchantId = "test-check-ticket-userid";
  const membershipId = "test-crezco-membershipid";
  const userId = "oGvgPQWN4FdL9tBGO7HVeYhAEzl2"; //olicairns93 in dev
  const ticketId = "testTicketCheckTicketId";
  const eventId = "testEvent";
  const productId = "1234";

  before(async () => {
    await createMerchant(merchantId);
    await createMembership(merchantId, userId, membershipId);
  });
  it("Should return user", async () => {
    const userToken = await createUserToken(userId);
    const res = await api
      .get(`/merchants/m/${merchantId}/users/`)
      .auth(userToken, { type: "bearer" });
    expect(res).to.have.status(200);
    expect(res.body.length).to.equal(1);
    expect(res.body[0].id).to.equal(userId);
  });

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
