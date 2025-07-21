import { expect } from "@playwright/test";
import { test } from "../fixtures/metamask";

test.describe.configure({
    mode: "serial",
});

test.describe("Metamask", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
    });

    test("should render 'Ether Deposit' transaction form", async ({
        wallet,
        page,
    }) => {
        const connectButton = page.getByText("Connect Wallet");
        await connectButton.click();
        const metamaskButton = page.getByText("Metamask");
        await metamaskButton.click();
        await wallet.approve();

        const sendTransactionButton = page.getByTestId("transaction-button");
        await sendTransactionButton.click();

        const modal = page.getByRole("dialog");
        await expect(modal).toBeVisible();

        await expect(page.getByText("Ether Deposit")).toBeHidden();
        await expect(modal.getByTestId("ether-deposit-form")).toBeVisible();

        await expect(
            modal.getByText("The application smart contract address"),
        ).toBeVisible();

        const applicationInput = page.getByTestId("application-input");
        await applicationInput.focus();
        const option = page.getByRole("option").first();
        await option.click();

        await expect(
            modal.getByText("Amount of ether to deposit"),
        ).toBeVisible();
        await expect(
            modal.getByText(
                "Extra execution layer data handled by the application",
            ),
        ).toBeHidden();
    });

    test("should render 'Raw Input' transaction form", async ({
        wallet,
        page,
    }) => {
        const connectButton = page.getByText("Connect Wallet");
        await connectButton.click();
        const metamaskButton = page.getByText("Metamask");
        await metamaskButton.click();
        await wallet.approve();
        const sendTransactionButton = page.getByTestId("transaction-button");
        await sendTransactionButton.click();

        const modal = page.getByRole("dialog");
        await expect(modal).toBeVisible();

        const selectInput = modal.locator('input[value="Ether Deposit"]');
        await selectInput.click();
        await page.getByText("Generic Input").click();

        await expect(modal.getByTestId("raw-input-form")).toBeVisible();
        await expect(
            modal.getByText("The application smart contract address"),
        ).toBeVisible();

        const applicationInput = page.getByTestId("application-autocomplete");
        await applicationInput.focus();
        const option = page.getByRole("option").first();
        await option.click();

        await expect(
            modal.getByText("Hex input for the application"),
        ).toBeVisible();
    });
});
