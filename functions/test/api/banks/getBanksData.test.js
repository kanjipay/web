import "mocha"
import { api, expect } from "../../utils/server";

describe("Get Banks Data GB", () => {
  it("Should get valid banks data", async (done) => {
    const res = await api.get('banks/GB')
    .end((err, res) => {
      expect(res).to.have.status(200);
      expect(res.body).to.be.a("object")
      expect(err).to.be.null;
      done();
      });
  })
})
