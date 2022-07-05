import "mocha";
import { db } from "../../utils/admin";
import { api, expect } from "../../utils/server";
import Collection from "../../../src/shared/enums/Collection";
import {
  createEvent,
  createMerchant,
  createProduct,
  createMembership,
} from "../../utils/generateTestData";
import { firestore } from "firebase-admin";
import { addHours } from "date-fns";
import { createUserToken } from "../../utils/user";

import { HttpStatusCode } from "../../../src/shared/utils/errors";

describe("Create ticket", () => {
  const validTicketId = "valid-ticket";
  const incorrectEntryTimeTicketId = "incorrect-entry-time";
  const incorrectEventTicketId = "incorrect-event";
  const nonexistentEventTicketId = "nonexistant-event";
  const usedTicketId = "used";

  const merchantId = "test-create-ticket-merchant";
  const eventId = "test-create-ticket-event";
  const incorrectEventId = "test-create-ticket-incorrect-event";
  const productId = "test-create-ticket-product";
  const userId = "oGvgPQWN4FdL9tBGO7HVeYhAEzl2"; //olicairns93 in dev
  const orderId = "test-create-ticket-order";
  const membershipId = "test-create-ticket-mb";

  const defaultTicketData = {
    merchantId,
    eventId,
    productId,
    orderId,
    userId,
    createdAt: firestore.FieldValue.serverTimestamp(),
    wasUsed: false,
    eventEndsAt: addHours(new Date(), 6),
  };

  const usedAt = addHours(new Date(), -1);
  const earliestEntryAt = addHours(new Date(), 1);

  function generateTicketCreationPromise(
    ticketId: string,
    ticketData: any = {}
  ) {
    return db
      .collection(Collection.TICKET)
      .doc(ticketId)
      .create({
        ...defaultTicketData,
        ...ticketData,
      });
  }

  before(async () => {
    await Promise.all([
      createMerchant(merchantId),
      createMembership(merchantId, userId, membershipId),
      createEvent(merchantId, eventId),
      createEvent(merchantId, incorrectEventId),
      createProduct(merchantId, eventId, productId),
      generateTicketCreationPromise(validTicketId),
      generateTicketCreationPromise(incorrectEntryTimeTicketId, {
        earliestEntryAt,
      }),
      generateTicketCreationPromise(incorrectEventTicketId, {
        eventId: incorrectEventId,
      }),
      generateTicketCreationPromise(nonexistentEventTicketId, {
        eventId: "nonexistent-id",
      }),
      generateTicketCreationPromise(usedTicketId, { wasUsed: true, usedAt }),
    ]);
  });

  it("Should accept a valid ticket", async () => {
    const userToken = await createUserToken(userId);

    const res = await api
      .post(`/merchants/m/${merchantId}/tickets/${validTicketId}/check`)
      .auth(userToken, { type: "bearer" })
      .send({ eventId });
    expect(res.status).to.eql(200);
    const ticketDoc = await db
      .collection(Collection.TICKET)
      .doc(validTicketId)
      .get();

    expect(ticketDoc.exists).to.eql(true);
    expect(ticketDoc.data().wasUsed).to.eql(true);
    expect(ticketDoc.data().usedAt).is.not.undefined;
  });

  it("Should not accept a ticket with an incorrect event id", async () => {
    const userToken = await createUserToken(userId);
    const res = await api
      .post(
        `/merchants/m/${merchantId}/tickets/${incorrectEventTicketId}/check`
      )
      .auth(userToken, { type: "bearer" })
      .send({ eventId });

    expect(res.status).to.eql(HttpStatusCode.BAD_REQUEST);
  });

  it("Should report was used if already used", async () => {
    const userToken = await createUserToken(userId);
    const res = await api
      .post(`/merchants/m/${merchantId}/tickets/${usedTicketId}/check`)
      .auth(userToken, { type: "bearer" })
      .send({ eventId });
    expect(res.status).to.eql(200);
    expect(res.body.wasUsed).to.eql(true);
  });

  after(async () => {
    const batch = db.batch();

    const deleteMap = {
      [Collection.MERCHANT]: [merchantId],
      [Collection.EVENT]: [eventId, incorrectEventId],
      [Collection.PRODUCT]: [productId],
      [Collection.TICKET]: [
        validTicketId,
        incorrectEntryTimeTicketId,
        incorrectEventTicketId,
        nonexistentEventTicketId,
        usedTicketId,
      ],
      [Collection.MEMBERSHIP]: [membershipId],
    };

    for (const [collectionName, ids] of Object.entries(deleteMap)) {
      for (const id of ids) {
        const docRef = db.collection(collectionName).doc(id);
        batch.delete(docRef);
      }
    }

    await batch.commit();
  });
});
