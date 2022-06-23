import "mocha"
import { api, expect } from "../../utils/server";
import { createLink } from "../../utils/generateTestData";
import {addHours} from "date-fns"; 
import { db } from "../../utils/admin";
import Collection from "../../../src/shared/enums/Collection"


describe("Get link", () => {
  const validLinkId = "valid-link";
  const expiredLinkId = 'expired-link';
  const usedLinkId = 'used-link';

  before(async () => {
    await Promise.all([
      createLink(validLinkId, false, addHours(new Date(), 24)),
      createLink(expiredLinkId, false, addHours(new Date(), -1)),
      createLink(usedLinkId, true, addHours(new Date(), 24)),
    ])
  });  

  it("Should succeed with valid link", (done) => {
    api.get(`/links/l/${validLinkId}`)
    .end(function(err, res) {
      expect(res).to.have.status(200);
      done();                               
    });
  });

  it("Should fail with expired link", (done) => {
    api.get(`/links/l/${expiredLinkId}`)
    .end(function(err, res) {
      expect(res).to.have.status(400);
      done();                               
    });
  });

  it("Should fail with used link", (done) => {
    api.get(`/links/l/${usedLinkId}`)
    .end(function(err, res) {
      expect(res).to.have.status(400);
      done();                               
    });        
  });
  it("Should fail with nonexistent link", (done) => {
    api.get(`/links/l/does-not-exist`)
    .end(function(err, res) {
      expect(res).to.have.status(404);
      done();                               
    });        
  });

  after(async () => {
    const batch = db.batch();
    batch.delete(db.collection(Collection.LINK).doc(validLinkId));
    batch.delete(db.collection(Collection.LINK).doc(expiredLinkId));
    batch.delete(db.collection(Collection.LINK).doc(usedLinkId));
    await batch.commit();
  });
})
