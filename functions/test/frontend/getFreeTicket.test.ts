import { baseUrl } from "./utils/baseUrl"
import { sleep } from "./utils/sleep"
import { findElementByTestId, findElementByTestName, findElementsByTestName } from "./utils/findByTestValues"
import * as chai from "chai"
import * as puppeteer from "puppeteer"

require('dotenv').config();

const expect = chai.expect;

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 250
  })

  const page = await browser.newPage()
  await page.goto(`${baseUrl}/events/trinity`);

  const eventListings = await findElementsByTestName(page, "event-listing")
  expect(eventListings.length).to.eql(1)
  await eventListings[0].click()

  const productListings = await findElementsByTestName(page, "product-listing")
  expect(productListings.length).to.eql(3)

  // Check the order of the listings
  const firstListingTitle = await findElementByTestName(productListings[0], "product-listing-title")
  expect(await firstListingTitle.getText()).to.eql("General Admission")
  const firstListingMessage = await findElementByTestName(productListings[0], "product-listing-message")
  expect(await firstListingMessage.getText()).to.eql("£10.00")

  const secondListingMessage = await findElementByTestName(productListings[1], "product-listing-message")
  expect(await secondListingMessage.getText()).to.eql("Free")

  await productListings[1].click()

  const loginButton = await findElementByTestId(page, "product-cta-button")
  await loginButton.click()

  await page.click('*[test-id="google-auth-button"]')

  await sleep(3000)

  await page.type('input[type="email"]', process.env.GOOGLE_AUTH_EMAIL)
  await page.click('#identifierNext')

  await sleep(3000)

  const passwordField = await driver.findElement(By.css('input[type="password"]'))
  const finishButton = await driver.findElement(By.css('#identifierNext'))
  await passwordField.sendKeys(process.env.GOOGLE_AUTH_PASSWORD)
  await finishButton.click()

  await sleep(3000)

})()

async function goToProductPage(driver: WebDriver) {
  const eventListings = await findElementsByTestName(driver, "event-listing")
  expect(eventListings.length).to.eql(1)
  await eventListings[0].click()
  const productListings = await findElementsByTestName(driver, "product-listing")

  expect(productListings.length).to.eql(3)

  // Check the order of the listings
  const firstListingTitle = await findElementByTestName(productListings[0], "product-listing-title")
  expect(await firstListingTitle.getText()).to.eql("General Admission")
  const firstListingMessage = await findElementByTestName(productListings[0], "product-listing-message")
  expect(await firstListingMessage.getText()).to.eql("£10.00")

  const secondListingMessage = await findElementByTestName(productListings[1], "product-listing-message")
  expect(await secondListingMessage.getText()).to.eql("Free")

  await productListings[1].click()
}

async function authenticate(driver: WebDriver) {
  const googleAuthButton = await findElementByTestId(driver, "google-auth-button")
  await googleAuthButton.click()

  await sleep(3000)
  
  const emailField = await driver.findElement(By.css('input[type="email"]'))
  const nextButton = await driver.findElement(By.css('#identifierNext'))

  console.log(process.env.GOOGLE_AUTH_EMAIL)
  await emailField.sendKeys(process.env.GOOGLE_AUTH_EMAIL)
  await nextButton.click()

  await sleep(3000)

  const passwordField = await driver.findElement(By.css('input[type="password"]'))
  const finishButton = await driver.findElement(By.css('#identifierNext'))
  await passwordField.sendKeys(process.env.GOOGLE_AUTH_PASSWORD)
  await finishButton.click()

  await sleep(3000)
}

async function purchaseTicketForFree() {
  const driver = await getDriver()

  await goToProductPage(driver)

  const loginButton = await findElementByTestId(driver, "product-cta-button")
  await loginButton.click()

  await authenticate(driver)

  const attestationCheckbox = await findElementByTestName(driver, "product-attestation-checkbox")
  attestationCheckbox.click()
  const checkoutButton = await findElementByTestId(driver, "product-cta-button")
  checkoutButton.click()
  
  await sleep(5000)
}

purchaseTicketForFree()