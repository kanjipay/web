import "mocha"
import { testId } from "../utils/findByTestValues"
import { checkoutProduct } from "../utils/checkoutProduct";
import { cleanTicketPurchases } from "../utils/cleanTicketPurchases";
import { openNewPage } from "../utils/browser";

require('dotenv').config()

describe("Buy Crezco ticket", () => {
  it("Should buy Crezco ticket", async () => {
    const page = await openNewPage()

    await checkoutProduct(page, "trinityThirdRelease")

    await page.waitForSelector(testId("bank-tile-mock-payments"))
    await page.click(testId("bank-tile-mock-payments"))

    await page.waitForSelector(testId("continue-to-bank-button"))
    await page.click(testId("continue-to-bank-button"))

    const crezcoNextStepButtonSelector = 'button[data-test-id="pay-demand-next-step"]'
    await page.waitForSelector(crezcoNextStepButtonSelector)
    await page.click(crezcoNextStepButtonSelector)

    const mockBankUsernameSelector = '#username'
    await page.waitForSelector(mockBankUsernameSelector)
    await page.type(mockBankUsernameSelector, "test_executed")

    for (const index of [3, 4, 6]) {
      await page.type(`#security-code-${index}`, "0")
    }

    await page.click("#continue")

    await page.waitForSelector("#cancel")
    await page.click("#continue")

    await page.waitForSelector(testId("ticket-order-confirmation-done-button"))
    await page.click(testId("ticket-order-confirmation-done-button"))
  })

  after(async () => {
    await cleanTicketPurchases("trinity")
  })
})