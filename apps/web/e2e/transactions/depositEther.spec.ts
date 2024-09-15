import { expect } from "@playwright/test";
import { test } from "../fixtures/metamask";
import * as metamask from "@synthetixio/synpress/commands/metamask";

test.describe.configure({
    mode: "serial",
    timeout: 120000,
});

test.afterAll(async ({ context }) => {
    await context.close();
});

test("should connect to MetaMask and enable 'Send Transaction' button", async ({
    page,
}) => {
    await page.goto("/");

    const sendTransactionButton = page.getByTestId("transaction-button");
    await expect(sendTransactionButton).toBeDisabled();

    const connectButton = page.getByText("Connect Wallet");
    await connectButton.click();

    const metamaskButton = page.getByText("Metamask");
    await metamaskButton.click();

    await metamask.acceptAccess();

    await expect(sendTransactionButton).toBeEnabled();
    await sendTransactionButton.click();
});
