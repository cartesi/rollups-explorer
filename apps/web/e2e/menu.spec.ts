import { expect, Page, test } from "@playwright/test";

const getHeadingText = (page: Page, text: string) =>
    page.locator('[data-testid="page-heading"]', {
        hasText: text,
    });

test.beforeEach(async ({ page }) => {
    await page.goto("/");
});

test.describe("Navigations", () => {
    test("can navigate to home page", async ({ page }) => {
        await page.getByTestId("home-link").click();
        await page.waitForURL("/");

        await expect(page.getByText("Latest inputs")).toBeVisible();
        await expect(page.getByText("Latest applications")).toBeVisible();
    });

    test("can navigate to applications page", async ({ page }) => {
        await page.getByTestId("applications-link").click();
        await page.waitForURL(`/applications`);

        await expect(getHeadingText(page, "Applications")).toBeVisible();

        await expect(
            page.getByRole("row", { name: "Id Owner URL" }),
        ).toBeVisible();

        await expect(page.getByRole("row")).toHaveCount(11);
    });

    test("can navigate to inputs page", async ({ page }) => {
        await page.getByTestId("inputs-link").click();
        await page.waitForURL(`/inputs`);

        await expect(
            page.getByPlaceholder("Search by Address / Txn Hash / Index"),
        ).toBeVisible();

        await expect(getHeadingText(page, "Inputs")).toBeVisible();

        await expect(
            page.getByRole("row", { name: "From To Method Index Age Data" }),
        ).toBeVisible();

        // For each input row it actually inserts 3 <tr>
        await expect(page.getByRole("row")).toHaveCount(31);
    });

    test("can navigate to connections page", async ({ page }) => {
        await page.getByTestId("settings-link").click();
        await page.getByTestId("connections-link").click();
        await page.waitForURL("/connections");

        // Verify page heading
        await expect(getHeadingText(page, "Connections")).toBeVisible();

        // Click on add-connection button
        await page.getByTestId("add-connection").click();

        // Verify that add-connection modal appears
        await expect(
            page.getByRole("heading", { name: "Create App Connection" }),
        ).toBeVisible();
    });

    test.describe("mobile", () => {
        test("can navigate to home page", async ({ page }) => {
            const burgerBtn = page.getByTestId("burger-menu-btn");
            await expect(burgerBtn).toBeVisible();
            await burgerBtn.click();

            await page.getByTestId("home-link").click();
            await page.waitForURL("/");

            await expect(page.getByText("Latest inputs")).toBeVisible();
            await expect(page.getByText("Latest applications")).toBeVisible();
        });

        test("can navigate to applications page", async ({ page }) => {
            const burgerBtn = page.getByTestId("burger-menu-btn");
            await expect(burgerBtn).toBeVisible();
            await burgerBtn.click();

            await page.getByTestId("applications-link").click();
            await page.waitForURL(`/applications`);

            await expect(getHeadingText(page, "Applications")).toBeVisible();

            await expect(
                page.getByRole("row", { name: "Id Owner URL" }),
            ).toBeVisible();

            await expect(page.getByRole("row")).toHaveCount(11);
        });

        test("can navigate to inputs page", async ({ page }) => {
            const burgerBtn = page.getByTestId("burger-menu-btn");
            await expect(burgerBtn).toBeVisible();
            await burgerBtn.click();

            await page.getByTestId("inputs-link").click();
            await page.waitForURL(`/inputs`);

            await expect(
                page.getByPlaceholder("Search by Address / Txn Hash / Index"),
            ).toBeVisible();

            await expect(getHeadingText(page, "Inputs")).toBeVisible();

            await expect(
                page.getByRole("row", {
                    name: "From To Method Index Age Data",
                }),
            ).toBeVisible();

            // For each input row it actually inserts 3 <tr>
            await expect(page.getByRole("row")).toHaveCount(31);
        });

        test("can navigate to connections page", async ({ page }) => {
            const burgerBtn = page.getByTestId("burger-menu-btn");
            await expect(burgerBtn).toBeVisible();
            await burgerBtn.click();

            await page.getByTestId("settings-link").click();
            await page.getByTestId("connections-link").click();
            await page.waitForURL("/connections");

            // Verify page heading
            await expect(getHeadingText(page, "Connections")).toBeVisible();

            // Click on add-connection button
            await page.getByTestId("add-connection").click();

            // Verify that add-connection modal appears
            await expect(
                page.getByRole("heading", { name: "Create App Connection" }),
            ).toBeVisible();
        });
    });
});
