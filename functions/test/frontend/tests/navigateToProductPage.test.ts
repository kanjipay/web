import { baseUrl } from "../utils/baseUrl"
import * as chai from "chai"
import { testName, testId } from "../utils/findByTestValues"
import { openNewPage } from "../utils/browser"
import { getText } from "../utils/puppeteer"

require("dotenv").config()

const expect = chai.expect

describe("Navigate to product page", () => {
  it("Should navigate to product page", async () => {
    const page = await openNewPage()

    await page.goto(`${baseUrl}/events/trinity`)

    await page.waitForSelector(testName("event-listing"))
    const eventListings = await page.$$(testName("event-listing"))
    expect(eventListings.length).to.eql(1)
    await eventListings[0].click()

    await page.waitForSelector(testName("product-listing"))
    const productListings = await page.$$(testName("product-listing"))
    expect(productListings.length).to.eql(4)

    // Check the order of the listings
    const firstListingTitle = await productListings[0].$(
      testName("product-listing-title")
    )
    expect(await getText(firstListingTitle)).to.eql("General Admission")
    const firstListingMessage = await productListings[0].$(
      testName("product-listing-message")
    )
    expect(await getText(firstListingMessage)).to.eql("£10.00")
    const secondListingMessage = await productListings[1].$(
      testName("product-listing-message")
    )
    expect(await getText(secondListingMessage)).to.eql("£0.00")

    await productListings[1].click()

    await page.waitForSelector(testId("stepper-value"))

    const stepperValueLabel = await page.$(testId("stepper-value"))
    const orderQuantityLabel = await page.$(
      testName("order-summary-line-item-quantity")
    )

    expect(await getText(stepperValueLabel)).to.eql("1")
    expect(await getText(orderQuantityLabel)).to.eql("1")

    await page.click(testId("stepper-increment-button"))
    expect(await getText(stepperValueLabel)).to.eql("2")
    expect(await getText(orderQuantityLabel)).to.eql("2")

    await page.click(testId("stepper-decrement-button"))
    expect(await getText(stepperValueLabel)).to.eql("1")
    expect(await getText(orderQuantityLabel)).to.eql("1")
  })
})
