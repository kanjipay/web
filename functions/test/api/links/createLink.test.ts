import "mocha"
import { api, expect } from "../../utils/server"
import Collection from "../../../src/shared/enums/Collection"
import { db } from "../../utils/admin"

describe("Create link", () => {
  const testPath = "TEST_PATH"
  const linkData = {
    path: testPath,
    stateId: "123",
  }

  it("Should successfully create a link", async () => {
    const res = await api.post("/links").send(linkData)
    expect(res).to.have.status(200)
  })
  after(async () => {
    const googleLinks = await db
      .collection(Collection.LINK)
      .where("path", "==", testPath)
      .get()
    const batch = db.batch()
    googleLinks.forEach((doc) => {
      db.collection(Collection.LINK).doc(doc.id)
    })
    await batch.commit()
  })
})
