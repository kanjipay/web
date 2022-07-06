import "mocha";
import { db } from "../../utils/admin";
import { api, expect } from "../../utils/server";
import Collection from "../../../src/shared/enums/Collection";
import { createMerchant, createMembership } from "../../utils/generateTestData";
import { createUserToken } from "../../utils/user";

describe("Add Crezco UserId", () => {
  const merchantId = "test-add-crezco-userid";
  const crezcoUserId = "test-crezco-userid";
  const membershipId = "test-crezco-membershipid";
  const userId = "oGvgPQWN4FdL9tBGO7HVeYhAEzl2"; //olicairns93 in dev
  before(async () => {
    await createMerchant(merchantId, { addCrezcoId: false });
    await createMembership(merchantId, userId, membershipId);
  });
  it("Should update crezco id", async () => {
    const userToken = await createUserToken(userId);
    const res = await api
      .put(`/merchants/m/${merchantId}/crezco`)
      .auth(userToken, { type: "bearer" })
      .send({ crezcoUserId });
    const merchantDoc = await db
      .collection(Collection.MERCHANT)
      .doc(merchantId)
      .get();
    expect(res).to.have.status(200);
    expect(merchantDoc.exists).to.eql(true);
    expect(merchantDoc.data().crezco.userId).to.eql(crezcoUserId);
  });

  after(async () => {
    await db.collection(Collection.MERCHANT).doc(merchantId).delete();
    await db.collection(Collection.MEMBERSHIP).doc(membershipId).delete();
  });
});
