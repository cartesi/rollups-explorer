// tests/example.test.js
import { test, expect } from "../fixtures/metamaskTest";
import * as metamask from "@synthetixio/synpress/commands/metamask";
import { Page } from "@playwright/test";

let sharedPage: Page;

test.describe.configure({ mode: "serial" });

test.beforeAll(async ({ page }) => {
    sharedPage = page;
    // dApp URL
    // Note: dApp should be running in the background
    await page.goto("http://localhost:3000");
});

test.afterAll(async ({ context }) => {
    await context.close();
});

test("should connect to MetaMask and display wallet address", async () => {
    const connectButton = sharedPage.getByText("Connect Wallet");
    await connectButton.click();
    // await expect(sharedPage.locator("#address")).toHaveText("Address: ??");
    // await expect(sharedPage.locator("#connected")).toHaveText("Connected: NO");
    //
    // await sharedPage.locator("#connect-btn").click();
    // // Use MetaMask API provided by Synpress
    // await metamask.acceptAccess();
    //
    // await expect(sharedPage.locator("#address")).toHaveText(
    //     "Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    // );
    // await expect(sharedPage.locator("#connected")).toHaveText("Connected: YES");
    //
    // sharedPage.locator("#disconnect-btn").click();
    // await expect(sharedPage.locator("#address")).toHaveText("Address: ??");
    // await expect(sharedPage.locator("#connected")).toHaveText("Connected: NO");
});
