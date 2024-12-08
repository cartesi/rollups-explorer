import { expect } from "@playwright/test";
import * as metamask from "@synthetixio/synpress/commands/metamask";
import { test } from "../fixtures/metamask";

test.describe.configure({
    mode: "serial",
    timeout: 120000,
});

test.describe.serial("Ether Deposit form", () => {
    test.afterEach(async ({ context }) => {
        if (context) {
            await context.close();
        }
    });

    test.skip("should render 'Ether Deposit' transaction form", async ({
        page,
    }) => {
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

    test.skip("should display errors for 'Ether Deposit' transaction form", async ({
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

        const applicationsAutocompleteInput =
            page.getByTestId("application-input");

        await applicationsAutocompleteInput.focus();
        await page.keyboard.type("invalid address");
        await applicationsAutocompleteInput.blur();
        await expect(form.getByText("Invalid application")).toBeVisible();

        await applicationsAutocompleteInput.focus();
        await page.keyboard.type("");

        const option = page.getByRole("option").first();

        await option.click();

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

    test.skip("should validate successfully 'Ether Deposit' transaction form", async ({
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

        const applicationInput = page.getByTestId("application-input");

        await applicationInput.focus();
        const option = page.getByRole("option").first();
        await option.click();

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

    test.skip("should render 'Raw Input' transaction form", async ({
        page,
    }) => {
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

    test.skip("should display errors for 'Raw Input' transaction form", async ({
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

    test.skip("should validate successfully 'Raw Input' transaction form", async ({
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
