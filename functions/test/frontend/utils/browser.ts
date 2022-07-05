import { Page, Browser } from "puppeteer";

const puppeteer = require("puppeteer-extra");
const PuppeteerStealth = require("puppeteer-extra-plugin-stealth");
puppeteer.use(PuppeteerStealth());

let browser: Browser | null = null;

export async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: false,
      args: [
        "--no-sandbox",
        "--disable-web-security",
        "--disable-features=IsolateOrigins",
        "--disable-site-isolation-trials",
      ],
    });
  }

  return browser;
}

export async function openNewPage(): Promise<Page> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  return page;
}
