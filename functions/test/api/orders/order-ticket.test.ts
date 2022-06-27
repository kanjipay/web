
import "mocha"
import { api, expect } from "../../utils/server";
import {createUserToken} from "../../utils/user";
import {createProduct} from '../../utils/generateTestData';

describe("Create Orders", () => {
    const userId = 'oGvgPQWN4FdL9tBGO7HVeYhAEzl2' //olicairns93 in dev
    const merchantId = 'test';
    const eventId = 'test';
    const productId = 'test';

    const orderData = {
        accountNumber: "00000000", 
        address: "8B Mitchison road", 
        companyName: "TEST", 
        displayName: "TEST", 
        sortCode: "000000", 
        description: "test", 
        photo:"photo"
    }

    before(async () => {
        await createProduct(merchantId, eventId, productId);
    });
  it("Should create a valid order", (done) => {
    createUserToken(userId).then((userToken) => {
        api.post('/order/ticket')
        .auth(userToken, { type: 'bearer' })
        .send(orderData)
        .end(function(err, res) {
          expect(res).to.have.status(200);
          done();
          })      
        });
    })
});