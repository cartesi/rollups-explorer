import { expect, Page, test } from "@playwright/test";
import { Address } from "viem";

const createConnection = async (page: Page, address: Address) => {
    const button = page.getByTestId("show-connection-modal");
    await button.click();

    const url = "https://honeypot.sepolia.rollups.staging.cartesi.io/graphql";
    await expect(page.getByText("Create App Connection")).toBeVisible();

    const addressInput = await page.getByTestId("connection-address");
    await addressInput.focus();
    await page.keyboard.type(address);

    const urlInput = await page.getByTestId("connection-url");
    await urlInput.focus();
    await page.keyboard.type(url);

    await expect(
        page.getByText("This application responded with"),
    ).toBeVisible();

    await page.keyboard.press("Enter");
    await expect(
        page.getByText(`Connection ${address} created with success`),
    ).toBeVisible();
};

test.beforeEach(async ({ page }) => {
    await page.goto("/connections");
});

test("should have correct page title", async ({ page }) => {
    await expect(page).toHaveTitle(/Connections \| CartesiScan/);
});

test("should have correct title", async ({ page }) => {
    const title = page.getByRole("heading", { name: "Connections" });
    await expect(title.first()).toBeVisible();
});

test("should have empty label", async ({ page }) => {
    await expect(page.getByText("No connections found.")).toBeVisible();
});

test("should be able to add a connection", async ({ page }) => {
    await createConnection(page, "0x60a7048c3136293071605a4eaffef49923e981cc");
});

test("should be able to remove a connection", async ({ page }) => {
    await createConnection(page, "0x60a7048c3136293071605a4eaffef49923e981cc");

    const deleteButton = page.getByTestId("remove-connection");
    await deleteButton.click();

    await expect(page.getByText("No connections found.")).toBeVisible();
});

test("should display correct list with connections", async ({ page }) => {
    const addresses: Address[] = [
        "0x60a7048c3136293071605a4eaffef49923e981cc",
        "0x70ac08179605af2d9e75782b8decdd3c22aa4d0c",
        "0x71ab24ee3ddb97dc01a161edf64c8d51102b0cd3",
    ];
    await Promise.all(
        addresses.map(async (address) => await createConnection(page, address)),
    );

    const connectionCards = page.getByTestId("connection-card");
    const connectionCardsCount = await connectionCards.count();

    expect(connectionCardsCount).toBe(addresses.length);
});
