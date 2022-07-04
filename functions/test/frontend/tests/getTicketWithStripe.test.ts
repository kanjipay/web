import "mocha"
import { checkoutProduct } from "../utils/checkoutProduct"
import { db } from "../../utils/admin"
import Collection from "../../../src/shared/enums/Collection"
import { testId } from "../utils/findByTestValues"
import { cleanTicketPurchases } from "../utils/cleanTicketPurchases"
import { openNewPage } from "../utils/browser"

require("dotenv").config()

async function updateMerchantCurrency(currency: string) {
  await db.collection(Collection.MERCHANT).doc("trinity").update({ currency })
}

describe("Buy Stripe ticket", () => {
  before(async () => {
    await updateMerchantCurrency("EUR")
  })

  it("Can buy Stripe ticket", async () => {
    const page = await openNewPage()

    await checkoutProduct(page, "trinityThirdRelease")

    const stripeIframeSelector = 'iframe[title="Secure payment input frame"]'
    const stripeFrameHandle = await page.waitForSelector(stripeIframeSelector)
    const stripeFrame = await stripeFrameHandle.contentFrame()

    await stripeFrame.waitForSelector("#Field-numberInput")
    await stripeFrame.type("#Field-numberInput", "4242424242424242")
    await stripeFrame.type("#Field-expiryInput", "0225")
    await stripeFrame.type("#Field-cvcInput", "123")
    await stripeFrame.type("#Field-postalCodeInput", "SW47JL")

    await page.click(testId("stripe-payment-button"))

    await page.waitForSelector(testId("ticket-order-confirmation-done-button"))
    await page.click(testId("ticket-order-confirmation-done-button"))
  })

  after(async () => [
    await Promise.all([
      updateMerchantCurrency("GBP"),
      cleanTicketPurchases("trinity"),
    ]),
  ])
})
