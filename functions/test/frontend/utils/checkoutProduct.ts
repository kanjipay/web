import { baseUrl } from "./baseUrl";
import { testId } from "./findByTestValues";
import { Page } from "puppeteer";

export async function checkoutProduct(page: Page, productId: string) {
  await page.goto(`${baseUrl}/events/trinity/mayBall/${productId}`);

  const checkoutButton = await page.waitForSelector(
    testId("product-cta-button")
  );
  await checkoutButton.click();
}
