import { Page } from "puppeteer";
import * as path from "path";

export async function isVisible(page: Page, selector: string) {
  try {
    await page.$(selector);

    return true;
  } catch {
    return false;
  }
}

export async function getText(element): Promise<string> {
  return await element.evaluate((e) => e.textContent)
}

export async function uploadImage(page: Page, selector: string) {
  const imagePickerInput = await page.$(selector)
  const filePath = path.relative(
    process.cwd(),
    __dirname.replace("/utils", "/assets") + "/festival_stage.jpg"
  )
  await imagePickerInput.uploadFile(filePath)
}
