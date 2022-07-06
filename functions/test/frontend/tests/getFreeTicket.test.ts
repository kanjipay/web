import "mocha";
import * as chai from "chai";
import { testId, testName } from "../utils/findByTestValues";
import { cleanTicketPurchases } from "../utils/cleanTicketPurchases";
import { openNewPage } from "../utils/browser";
import { baseUrl } from "../utils/baseUrl";

require("dotenv").config();

const expect = chai.expect;

describe("Buy free ticket", () => {
  it("Should buy a free ticket", async () => {
    const page = await openNewPage();

    await page.goto(`${baseUrl}/events/trinity/mayBall/trinitySecondRelease`);

    const checkoutButton = await page.waitForSelector(
      testId("product-cta-button")
    );

    expect(
      await checkoutButton.evaluate((e) => e.hasAttribute("disabled"))
    ).to.eql(true);

    await page.click(testName("product-attestation-checkbox"));

    expect(
      await checkoutButton.evaluate((e) => e.hasAttribute("disabled"))
    ).to.eql(false);

    await checkoutButton.click();

    await page.waitForSelector(testId("ticket-order-confirmation-done-button"));
    await page.click(testId("ticket-order-confirmation-done-button"));
  });

  after(async () => {
    await cleanTicketPurchases("trinity");
  });
});
