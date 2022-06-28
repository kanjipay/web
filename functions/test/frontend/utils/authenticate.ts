import { Page } from "puppeteer"
import { testId } from "./findByTestValues"
import { sleep } from "./sleep"

// This function assumes the auth page has been navigated to
export async function authenticate(page: Page) {
  await page.waitForSelector(testId("google-auth-button"))
  await page.click(testId("google-auth-button"))

  await page.waitForSelector('input[type="email"]')
  await page.type('input[type="email"]', process.env.GOOGLE_AUTH_EMAIL)
  await page.waitForSelector('#identifierNext')
  await page.click('#identifierNext')

  await sleep(1500)

  await page.waitForSelector('input[type="password"]')
  await page.type('input[type="password"]', process.env.GOOGLE_AUTH_PASSWORD)
  await page.waitForSelector('#passwordNext')
  await page.click('#passwordNext')
}