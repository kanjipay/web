import "mocha"
import { baseUrl } from "../utils/baseUrl";
import { openNewPage } from "../utils/browser";
import { authenticate } from "../utils/authenticate";
import { testId } from "../utils/findByTestValues";

describe("Authenticate", () => {
  it("Should authenticate", async () => {
    const page = await openNewPage()

    await page.goto(`${baseUrl}/dashboard`)
    await authenticate(page)

    await page.waitForSelector(testId("create-organisation-button"))
  })
})