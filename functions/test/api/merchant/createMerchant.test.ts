/*
Todo fix
import "mocha"
import { api, expect } from "../../utils/server";
import {createUserToken} from "../../utils/user";

describe("Create merchant", () => {
    const userId = 'oGvgPQWN4FdL9tBGO7HVeYhAEzl2' //olicairns93 in dev
    const merchantData = {
        accountNumber: "00000000", 
        address: "8B Mitchison road", 
        companyName: "TEST", 
        displayName: "TEST", 
        sortCode: "000000", 
        description: "test", 
        photo:"photo"
    }
  before(async () => {
  });  
  it("Should create a valid merchant", (done) => {
    createUserToken(userId).then((userToken) => {
        api.post('/merchants/create')
        .auth(userToken, { type: 'bearer' })
        .send(merchantData)
        .end(function(err, res) {
          expect(res).to.have.status(200);
          done();
          })      
        });
    })
});
*/