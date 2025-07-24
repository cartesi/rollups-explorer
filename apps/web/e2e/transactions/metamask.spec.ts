import { expect } from "@playwright/test";
import { test } from "../fixtures/metamask";

test.describe.configure({
    mode: "serial",
    timeout: 120000,
});

test.describe("Metamask", () => {
    test.beforeEach(async ({ wallet, page }) => {
        await page.goto("/");
        const connectButton = page.getByText("Connect Wallet");
        await connectButton.click();
        const metamaskButton = page.getByText("Metamask");
        await metamaskButton.click();
        await wallet.approve();
        const sendTransactionButton = page.getByTestId("transaction-button");
        await sendTransactionButton.click();
    });

    test("should render 'Ether Deposit' transaction form", async ({ page }) => {
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

    test("should render 'ERC-20' transaction form", async ({ page }) => {
        const modal = page.getByRole("dialog");
        await expect(modal).toBeVisible();

        const selectInput = modal.locator('input[value="Ether Deposit"]');
        await selectInput.click();
        await page.getByText("ERC-20 Deposit").click();

        await expect(modal.getByTestId("erc20-deposit-form")).toBeVisible();
        await expect(
            modal.getByText("The application smart contract address"),
        ).toBeVisible();

        const applicationInput = page.getByTestId("application-input");
        await applicationInput.focus();
        const option = page.getByRole("option").first();
        await option.click();

        await expect(
            modal.getByText("The ERC-20 smart contract address"),
        ).toBeVisible();
    });

    test("should render 'ERC-721' transaction form", async ({ page }) => {
        const modal = page.getByRole("dialog");
        await expect(modal).toBeVisible();

        const selectInput = modal.locator('input[value="Ether Deposit"]');
        await selectInput.click();
        await page.getByText("ERC-721 Deposit").click();

        await expect(modal.getByTestId("erc721-deposit-form")).toBeVisible();
        await expect(
            modal.getByText("The application smart contract address"),
        ).toBeVisible();

        const applicationInput = page.getByTestId("application");
        await applicationInput.focus();
        const option = page.getByRole("option").first();
        await option.click();

        await expect(
            modal.getByText("The ERC-721 smart contract address"),
        ).toBeVisible();
    });

    test("should render 'ERC-1155' transaction form", async ({ page }) => {
        const modal = page.getByRole("dialog");
        await expect(modal).toBeVisible();

        const selectInput = modal.locator('input[value="Ether Deposit"]');
        await selectInput.click();
        await page.getByText("ERC-1155 Deposit").click();

        await expect(modal.getByTestId("erc1155-deposit-form")).toBeVisible();
        await expect(
            modal.getByText("The application smart contract address"),
        ).toBeVisible();

        const applicationInput = page.getByTestId("application");
        await applicationInput.focus();
        const option = page.getByRole("option").first();
        await option.click();

        await expect(
            modal.getByText("The ERC-1155 smart contract address"),
        ).toBeVisible();
    });

    test("should render 'ERC-1155 Batch' transaction form", async ({
        page,
    }) => {
        const modal = page.getByRole("dialog");
        await expect(modal).toBeVisible();

        const selectInput = modal.locator('input[value="Ether Deposit"]');
        await selectInput.click();
        await page.getByText("ERC-1155 Batch Deposit").click();

        await expect(
            modal.getByTestId("erc1155-batch-deposit-form"),
        ).toBeVisible();
        await expect(
            modal.getByText("The application smart contract address"),
        ).toBeVisible();

        const applicationInput = page.getByTestId("application");
        await applicationInput.focus();
        const option = page.getByRole("option").first();
        await option.click();

        await expect(
            modal.getByText("The ERC-1155 smart contract address"),
        ).toBeVisible();
    });

    test("should render 'Application Address' transaction form", async ({
        page,
    }) => {
        const modal = page.getByRole("dialog");
        await expect(modal).toBeVisible();

        const selectInput = modal.locator('input[value="Ether Deposit"]');
        await selectInput.click();
        await page.getByText("Application Address").click();

        await expect(modal.getByTestId("address-relay-form")).toBeVisible();
        await expect(
            modal.getByText("The application address to relay."),
        ).toBeVisible();
    });

    test("should render 'Generic Input' transaction form", async ({ page }) => {
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
