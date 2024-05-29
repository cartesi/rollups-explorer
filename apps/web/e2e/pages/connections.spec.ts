import { expect, test } from "@playwright/test";

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
    const button = page.getByTestId("show-connection-modal");
    await button.click();

    const address = "0x60a7048c3136293071605a4eaffef49923e981cc";
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
});

test("should be able to remove a connection", async ({ page }) => {
    const button = page.getByTestId("show-connection-modal");
    await button.click();

    const address = "0x60a7048c3136293071605a4eaffef49923e981cc";
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

    const deleteButton = page.getByTestId("remove-connection");
    await deleteButton.click();

    await expect(page.getByText("No connections found.")).toBeVisible();
});
