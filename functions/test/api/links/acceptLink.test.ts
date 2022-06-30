import "mocha"
import { api, expect } from "../../utils/server";
import { createLink } from "../../utils/generateTestData";
import {addHours} from "date-fns"; 
import { db } from "../../utils/admin";
import Collection from "../../../src/shared/enums/Collection"


describe("Accept link", () => {
  const toAcceptLinkId = "to-accept-link";

  before(async () => {
    createLink(toAcceptLinkId, false, addHours(new Date(), 24))
  });  

  it("Should accept a valid link", (done) => {
    api.put(`/links/l/${toAcceptLinkId}/accept`)
    .end(function(err, res) {
      expect(res).to.have.status(200);
      db.collection(Collection.LINK).doc(toAcceptLinkId).get().then((value) => {
        expect(value.exists).to.eql(true);
        expect(value.data().wasUsed).to.eql(true);
        done();                               
      })      
    });
  });


  after(async () => {
    db.collection(Collection.LINK).doc(toAcceptLinkId).delete();
  });
})
