require('chromedriver');
import { Builder } from "selenium-webdriver"
import * as chrome from "selenium-webdriver/chrome"

export async function getDriver() {
  let options = new chrome.Options()
    .addArguments("start-maximized", "--disable-blink-features=AutomationControlled", "--disable-blink-features")
    .excludeSwitches("enable-automation")
    

  let driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build()

  await driver.manage().setTimeouts({ implicit: 5000 })
  
  await driver.executeScript("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")

  return driver
}