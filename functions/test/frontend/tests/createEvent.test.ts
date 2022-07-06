import "mocha"
import * as chai from "chai"
import { baseUrl } from "../utils/baseUrl"
import { testId } from "../utils/findByTestValues"
import { db } from "../../utils/admin"
import Collection from "../../../src/shared/enums/Collection"
import { sleep } from "../utils/sleep"
import { openNewPage } from "../utils/browser"
import { isVisible, uploadImage } from "../utils/puppeteer"

require("dotenv").config()

const expect = chai.expect

describe("Create event", () => {
  it("Can create event", async () => {
    const page = await openNewPage()

    await page.goto(`${baseUrl}/dashboard/o/trinity/events`)

    const createEventButton = await page.waitForSelector(
      testId("create-event-button")
    )
    await createEventButton.click()

    await page.type(testId("field-title"), "Test event")
    await page.type(testId("textarea-description"), "Example description")
    await uploadImage(page, testId("image-picker-input-photo"))
    await page.type(testId("field-address"), "Example address")

    await page.click(
      `${testId("date-picker-startsAt")} ${testId("date-picker-increment")}`
    )
    await page.click(
      `${testId("date-picker-endsAt")} ${testId("date-picker-increment")}`
    )
    await page.click(
      `${testId("date-picker-endsAt")} ${testId("date-picker-increment")}`
    )

    await page.click(testId("form-submit-create-event"))

    const createProductButton = await page.waitForSelector(
      testId("create-product-button")
    )
    await createProductButton.click()

    const createProductFormButton = await page.waitForSelector(
      testId("form-submit-create-product")
    )

    await page.type(testId("field-title"), "Product title")
    await page.type(testId("textarea-description"), "Example description")
    await page.type(testId("field-price"), "10")
    await page.type(testId("field-capacity"), "1000")

    await page.click(
      `${testId("date-picker-earliestEntryAt")} ${testId(
        "checkbox-date-picker-isblank"
      )}`
    )
    await page.click(
      `${testId("date-picker-earliestEntryAt")} ${testId(
        "date-picker-increment"
      )}`
    )

    await createProductFormButton.click()

    const saveButton = await page.waitForSelector(testId("form-submit-save"))
    const priceField = await page.$(testId("field-price"))
    await priceField.focus()
    await page.keyboard.press("Backspace")
    await page.keyboard.press("Backspace")
    await page.type(testId("field-price"), "12")
    await saveButton.click()

    await sleep(2000)

    const priceValue = await priceField.evaluate((x) => x.getAttribute("value"))

    expect(priceValue).to.eql("12")

    await sleep(2000)

    const isPriceFieldDisabled = await priceField.evaluate((x) =>
      x.hasAttribute("disabled")
    )
    expect(isPriceFieldDisabled).to.eql(
      true,
      "Price field not disabled after publishing product"
    )

    // Now go back to event page
    await page.click(testId("breadcrumb-event"))

    const publishEventButton = await page.waitForSelector(
      testId("publish-event-button")
    )
    await publishEventButton.click()

    const confirmPublishEventButton = await page.waitForSelector(
      testId("confirm-publish-event-button")
    )
    await confirmPublishEventButton.click()
  })

  after(async () => {
    const batch = db.batch()

    const fetchTestEvents = db
      .collection(Collection.EVENT)
      .where("title", "==", "Test event")
      .get()

    const fetchTestProducts = db
      .collection(Collection.PRODUCT)
      .where("title", "==", "Test product")
      .get()

    const [testEvents, testProducts] = await Promise.all([
      fetchTestEvents,
      fetchTestProducts,
    ])

    for (const event of testEvents.docs) {
      batch.delete(db.collection(Collection.EVENT).doc(event.id))
    }

    for (const product of testProducts.docs) {
      batch.delete(db.collection(Collection.PRODUCT).doc(product.id))
    }

    await batch.commit()
  })
})
