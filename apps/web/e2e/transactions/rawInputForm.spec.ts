import { expect } from "@playwright/test";
import { test } from "../fixtures/metamask";
import * as metamask from "@synthetixio/synpress/commands/metamask";

test.describe.configure({
    mode: "serial",
    timeout: 120000,
});

test.describe.serial("Raw Input deposit form", () => {
    test.afterEach(async ({ context }) => {
        if (context) {
            await context.close();
        }
    });

    test("should render 'Raw Input' transaction form", async ({ page }) => {
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

        const selectInput = modal.locator('input[value="Ether Deposit"]');
        await selectInput.click();
        await page.getByText("Raw Input").click();

        await expect(modal.getByTestId("raw-input-form")).toBeVisible();

        await expect(
            modal.getByText("The application smart contract address"),
        ).toBeVisible();
        await expect(
            modal.getByText("Raw input for the application"),
        ).toBeVisible();

        const radioGroup = modal.getByRole("radiogroup");
        await expect(radioGroup.getByText("String to Hex")).toBeVisible();

        await radioGroup.getByText("String to Hex").click();
        await expect(
            modal.getByText("String input for the application"),
        ).toBeVisible();
        await expect(
            modal.getByText("Encoded hex value for the application"),
        ).toBeVisible();
    });

    test("should display errors for 'Raw Input' transaction form", async ({
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

        const selectInput = modal.locator('input[value="Ether Deposit"]');
        await selectInput.click();
        await page.getByText("Raw Input").click();

        const form = modal.getByTestId("raw-input-form");
        await expect(form).toBeVisible();

        const applicationsAutocompleteInput = form.locator(
            '[data-path="application"]',
        );
        await applicationsAutocompleteInput.focus();
        await page.keyboard.type("invalid address");
        await applicationsAutocompleteInput.blur();
        await expect(form.getByText("Invalid application")).toBeVisible();

        const extraDataLocator = form.locator("textarea");
        await extraDataLocator.focus();
        await page.keyboard.type("invalid hex");
        await extraDataLocator.blur();
        await expect(form.getByText("Invalid hex string")).toBeVisible();
    });

    test("should validate successfully 'Raw Input' transaction form", async ({
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

        const selectInput = modal.locator('input[value="Ether Deposit"]');
        await selectInput.click();
        await page.getByText("Raw Input").click();

        const form = modal.getByTestId("raw-input-form");
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
