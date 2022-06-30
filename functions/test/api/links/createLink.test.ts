import "mocha"
import { api, expect } from "../../utils/server";
import Collection from "../../../src/shared/enums/Collection"
import { db } from "../../utils/admin";

describe("Create link", () => {
  const testPath = 'TEST_PATH';
  const linkData =  {
      path:testPath,
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
  after(async () => {
    const googleLinks = await db.collection(Collection.LINK).where("path", "==", testPath).get();
    googleLinks.forEach((doc) => {
      db.collection(Collection.LINK).doc(doc.id);
    });
  });
})
