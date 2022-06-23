import "mocha"
import { api, expect } from "../../utils/server";

describe("Create link", () => {
  const linkData =  {
      path:'https://google.com',
      stateId: "123"
    };

  it("Should successfully create a link", (done) => {
    api
        .post('/links')
        .send(linkData)
        .end(function(err, res) {
            expect(res).to.have.status(200);
            done();                               
          });
  })
  /*
  possible todo delete the created link in an after
  */
})
