import "mocha"
import { api, expect } from "../../utils/server";
import { createUser, createTicket } from "../../utils/generateTestData";
import { db } from "../../utils/admin";
import {createUserToken} from "../../utils/user";
import Collection from "../../../src/shared/enums/Collection";


describe("Get tickets", () => {
  const userId = 'oGvgPQWN4FdL9tBGO7HVeYhAEzl2' //olicairns93 in dev;
  const ticketId = 'test-get-ticket-ticket';
  before(async () => {
    createUser(userId);
    createTicket(ticketId, userId);
  });  
  it("Should get Oliver's tickets", (done) => {
    createUserToken(userId).then((userToken) => {
        api.get('/tickets')
        .set("Authorization",`Bearer ${userToken}`)
        .end(function(err, res) {
          expect(res).to.have.status(200);
          /*
          todo check user has expected ticket
          */ 
          done();
          })      
        });
    })
  after(async () => {
    const batch = db.batch();
    batch.delete(db.collection(Collection.TICKET).doc(ticketId));
    await batch.commit();
  });
});