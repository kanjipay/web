import "mocha"
import { baseUrl } from "../utils/baseUrl"
import { testId } from "../utils/findByTestValues"
import { db } from "../../utils/admin"
import Collection from "../../../src/shared/enums/Collection"
import { openNewPage } from "../utils/browser"
import { uploadImage } from "../utils/puppeteer"
import { fetchDocumentsInArray } from "../../../src/shared/utils/fetchDocumentsInArray"
import * as chai from "chai"

require("dotenv").config()
const expect = chai.expect

describe("Create merchant", () => {
  it("Should create merchant", async () => {
    const page = await openNewPage()

    await page.goto(`${baseUrl}/dashboard`)

    const createOrgButton = await page.waitForSelector(
      testId("create-organisation-button")
    )
    await createOrgButton.click()

    await page.waitForSelector(testId("field-displayName"))

    await page.type(testId("field-displayName"), "Test merchant")
    await page.type(testId("textarea-description"), "Description")
    await uploadImage(page, testId("image-picker-input-photo"))
    await page.type(testId("field-address"), "Address")
    await page.type(testId("field-companyName"), "Company name")
    await page.type(testId("field-sortCode"), "000000")
    await page.type(testId("field-accountNumber"), "12341234")
    await page.click(testId("form-submit-create-organisation"))

    const settingsNavLink = await page.waitForSelector(
      testId("nav-link-settings")
    )

    await settingsNavLink.click()

    const connectCrezcoButton = await page.waitForSelector(
      testId("connect-crezco-button")
    )
    await connectCrezcoButton.click()

    const signInLink = await page.waitForSelector("#signInLink")
    await signInLink.click()

    await page.waitForSelector("#signInName")
    await page.type("#signInName", process.env.CREZCO_AUTH_EMAIL)
    await page.type("#password", process.env.CREZCO_AUTH_PASSWORD)
    await page.click("#next")

    const confirmBankButton = await page.waitForSelector(
      'button[data-test-id="confirm-onboarding"]'
    )

    await confirmBankButton.click()

    const crezcoConnectedButton = await page.waitForSelector(
      testId("icon-primary-button-crezco-connected")
    )

    await crezcoConnectedButton.click()

    const settingsNavLinkAgain = await page.waitForSelector(
      testId("nav-link-settings")
    )

    await settingsNavLinkAgain.click()

    const connectStripeButton = await page.waitForSelector(
      testId("connect-stripe-button")
    )
    await connectStripeButton.click()

    const stripeEmailField = await page.waitForSelector("#email")
    await stripeEmailField.type(process.env.STRIPE_AUTH_EMAIL)
    await page.click('button[type="submit"]')

    const stripePasswordField = await page.waitForSelector("#password")
    await stripePasswordField.type(process.env.STRIPE_AUTH_PASSWORD)
    await page.click('button[type="submit"]')

    await page.waitForSelector(".ToggleBoxItem")

    // await firstToggleBox.click()
    await page.click('button[type="button"]')

    const stripeConnectedButton = await page.waitForSelector(
      testId("icon-primary-button-stripe-connected")
    )

    const pageTitleTag = await page.$(testId("icon-title-stripe-connected"))
    const pageTitle = pageTitleTag.evaluate((e) => e.textContent)
    expect(pageTitle).to.eql("Card payments enabled")

    await stripeConnectedButton.click()
  })

  after(async () => {
    const merchantsToDelete = await db
      .collection(Collection.MERCHANT)
      .where("displayName", "==", "Test merchant")
      .get()

    const merchantIds = merchantsToDelete.docs.map((doc) => doc.id)

    const membershipsToDelete = await fetchDocumentsInArray(
      db.collection(Collection.MEMBERSHIP),
      "merchantId",
      merchantIds
    )

    const batch = db.batch()

    for (const merchantId of merchantIds) {
      batch.delete(db.collection(Collection.MERCHANT).doc(merchantId))
    }

    for (const membership of membershipsToDelete) {
      batch.delete(db.collection(Collection.MEMBERSHIP).doc(membership.id))
    }

    await batch.commit()
  })
})
