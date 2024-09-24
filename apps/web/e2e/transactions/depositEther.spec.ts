import { expect } from "@playwright/test";
import { test } from "../fixtures/metamask";
import * as metamask from "@synthetixio/synpress/commands/metamask";

test.describe.configure({
    mode: "serial",
    timeout: 120000,
});

test.describe.serial("Ether Deposit form", () => {
    test.afterEach(async ({ context }) => {
        await context.close();
    });

    test("should render 'Ether Deposit' transaction form", async ({ page }) => {
        await page.goto("/");

        const connectButton = page.getByText("Connect Wallet");
        await connectButton.click();
        const metamaskButton = page.getByText("Metamask");
        await metamaskButton.click();
        await metamask.acceptAccess();
        const sendTransactionButton = page.getByTestId("transaction-button");
        await sendTransactionButton.click();

        const modal = page.getByRole("dialog");
        await expect(modal).toBeVisible();

        await expect(page.getByText("Ether Deposit")).toBeHidden();
        await expect(modal.getByTestId("ether-deposit-form")).toBeVisible();

        await expect(
            modal.getByText("The application smart contract address"),
        ).toBeVisible();
        await expect(
            modal.getByText("Amount of ether to deposit"),
        ).toBeVisible();
        await expect(
            modal.getByText(
                "Extra execution layer data handled by the application",
            ),
        ).toBeHidden();
    });

    test("should display errors for 'Ether Deposit' transaction form", async ({
        page,
    }) => {
        await page.goto("/");

        const connectButton = page.getByText("Connect Wallet");
        await connectButton.click();
        const metamaskButton = page.getByText("Metamask");
        await metamaskButton.click();
        await metamask.acceptAccess({
            switchNetwork: true,
        });
        const sendTransactionButton = page.getByTestId("transaction-button");
        await sendTransactionButton.click();

        const modal = page.getByRole("dialog");
        await expect(modal).toBeVisible();
        const form = modal.getByTestId("ether-deposit-form");
        await expect(form).toBeVisible();

        const applicationsAutocompleteInput = form.locator(
            '[data-path="application"]',
        );
        await applicationsAutocompleteInput.focus();
        await page.keyboard.type("invalid address");
        await applicationsAutocompleteInput.blur();
        await expect(form.getByText("Invalid application")).toBeVisible();

        const amountInput = form.locator('[data-path="amount"]');
        await amountInput.focus();
        await page.keyboard.type("0.0");
        await amountInput.blur();
        await expect(form.getByText("Invalid amount")).toBeVisible();

        const modalFooterActionButtons = form.locator(".mantine-Button-root");
        const advancedButton = modalFooterActionButtons.first();
        await advancedButton.click();
        const extraDataLocator = form.locator("textarea");
        await extraDataLocator.focus();
        await page.keyboard.type("invalid hex");
        await extraDataLocator.blur();
        await expect(form.getByText("Invalid hex string")).toBeVisible();
    });

    test("should validate successfully 'Ether Deposit' transaction form", async ({
        page,
    }) => {
        await page.goto("/");

        const connectButton = page.getByText("Connect Wallet");
        await connectButton.click();
        const metamaskButton = page.getByText("Metamask");
        await metamaskButton.click();
        await metamask.acceptAccess({
            switchNetwork: true,
        });
        const sendTransactionButton = page.getByTestId("transaction-button");
        await sendTransactionButton.click();

        const modal = page.getByRole("dialog");
        await expect(modal).toBeVisible();
        const form = modal.getByTestId("ether-deposit-form");
        await expect(form).toBeVisible();

        const applicationsAutocompleteInput = form.locator(
            '[data-path="application"]',
        );
        await applicationsAutocompleteInput.focus();
        const firstAddressNode = page
            .locator(".mantine-Autocomplete-option")
            .first()
            .locator("span");
        await expect(firstAddressNode).toBeVisible();
        const firstAddress = await firstAddressNode.textContent();

        await page.keyboard.type(firstAddress ?? "");
        await applicationsAutocompleteInput.blur();
        await expect(form.getByText("Invalid application")).not.toBeVisible();

        const amountInput = form.locator('[data-path="amount"]');
        await amountInput.focus();
        await page.keyboard.type("0.0000001");
        await amountInput.blur();
        await expect(form.getByText("Invalid amount")).not.toBeVisible();
        const modalFooterActionButtons = form.locator(".mantine-Button-root");
        const advancedButton = modalFooterActionButtons.first();
        await advancedButton.click();
        const extraDataLocator = form.locator("textarea");
        await extraDataLocator.click();
        await extraDataLocator.click();
        for (let i = 0; i <= 2; i++) {
            await page.keyboard.press("Backspace");
        }
        await page.keyboard.type("0x123");
        await extraDataLocator.blur();
        await expect(form.getByText("Invalid hex string")).not.toBeVisible();
    });
});
