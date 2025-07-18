import { expect, Page, test } from "@playwright/test";

const getPageTitle = (page: Page, text: string) =>
    page.locator('[data-testid="page-title"]', {
        hasText: text,
    });

test.beforeEach(async ({ page }) => {
    await page.goto("/");
});

test.describe("Navigations", () => {
    test("can navigate to home page", async ({ page }) => {
        // Click on home link
        await page.getByTestId("home-link").click();

        // Wait for navigation to home page
        await page.waitForURL("/");

        // Verify that latest inputs section is visible
        await expect(page.getByText("Latest inputs")).toBeVisible();

        // Verify that latest applications section is visible
        await expect(page.getByText("Latest applications")).toBeVisible();
    });

    test("can navigate to applications page", async ({ page }) => {
        // Click on applications link
        await page.getByTestId("applications-link").click();

        // Wait for navigation to applications page
        await page.waitForURL(`/applications`);

        // Verify page heading
        await expect(getPageTitle(page, "Applications")).toBeVisible();

        // Verify that table with correct columns is visible
        await expect(
            page.getByRole("row", { name: "Id Owner URL" }),
        ).toBeVisible();

        // Verify table rows' count
        await expect(page.getByRole("row")).toHaveCount(11);
    });

    test("can navigate to inputs page", async ({ page }) => {
        // Click on inputs link
        await page.getByTestId("inputs-link").click();

        // Wait for navigation to inputs page
        await page.waitForURL(`/inputs`);

        // Verify page heading
        await expect(getPageTitle(page, "Inputs")).toBeVisible();

        // Verify that inputs search is visible
        await expect(page.getByTestId("search-input")).toBeVisible();

        // Verify that table with correct columns is visible
        await expect(
            page.getByRole("row", {
                name: "Transaction Hash From To Version Method Index Status Age Data",
            }),
        ).toBeVisible();

        // Verify table rows' count. For each input row it actually inserts 3 <tr>
        await expect(page.getByRole("row")).toHaveCount(31);
    });

    test("can navigate to connections page", async ({ page }) => {
        // Click on settings menu
        await page.getByTestId("settings-link").click();

        // Click on connections link
        await page.getByTestId("connections-link").click();

        // Wait for navigation to connections page
        await page.waitForURL("/connections");

        // Verify page heading
        await expect(getPageTitle(page, "Connections")).toBeVisible();

        // Click on add-connection button
        await page.getByTestId("add-connection").click();

        // Verify that add-connection modal appears
        await expect(
            page.getByRole("heading", { name: "Create App Connection" }),
        ).toBeVisible();
    });

    test.describe("mobile", () => {
        test("can navigate to home page", async ({ page }) => {
            // Find and click the burger menu
            const burgerBtn = page.getByTestId("burger-menu-btn");
            await expect(burgerBtn).toBeVisible();
            await burgerBtn.click();

            // Click on home link
            await page.getByTestId("home-link").click();

            // Wait for navigation to home page
            await page.waitForURL("/");

            // Verify that latest inputs section is visible
            await expect(page.getByText("Latest inputs")).toBeVisible();

            // Verify that latest applications section is visible
            await expect(page.getByText("Latest applications")).toBeVisible();
        });

        test("can navigate to applications page", async ({ page }) => {
            // Find and click the burger menu
            const burgerBtn = page.getByTestId("burger-menu-btn");
            await expect(burgerBtn).toBeVisible();
            await burgerBtn.click();

            // Click on applications link
            await page.getByTestId("applications-link").click();

            // Wait for navigation to applications page
            await page.waitForURL(`/applications`);

            // Verify page heading
            await expect(getPageTitle(page, "Applications")).toBeVisible();

            // Verify that table with correct columns is visible
            await expect(
                page.getByRole("row", { name: "Id Owner URL" }),
            ).toBeVisible();

            // Verify table rows' count
            await expect(page.getByRole("row")).toHaveCount(11);
        });

        test("can navigate to inputs page", async ({ page }) => {
            // Find and click the burger menu
            const burgerBtn = page.getByTestId("burger-menu-btn");
            await expect(burgerBtn).toBeVisible();
            await burgerBtn.click();

            // Click on inputs link
            await page.getByTestId("inputs-link").click();

            // Wait for navigation to inputs page
            await page.waitForURL(`/inputs`);

            // Verify page heading
            await expect(getPageTitle(page, "Inputs")).toBeVisible();

            // Verify that inputs search is visible
            await expect(page.getByTestId("search-input")).toBeVisible();

            // Verify that table with correct columns is visible
            await expect(
                page.getByRole("row", {
                    name: "Transaction Hash From To Version Method Index Status Age Data",
                }),
            ).toBeVisible();

            // Verify table rows' count. For each input row it actually inserts 3 <tr>
            await expect(page.getByRole("row")).toHaveCount(31);
        });

        test("can navigate to connections page", async ({ page }) => {
            // Find and click the burger menu
            const burgerBtn = page.getByTestId("burger-menu-btn");
            await expect(burgerBtn).toBeVisible();
            await burgerBtn.click();

            // Click on settings menu
            await page.getByTestId("settings-link").click();

            // Click on connections link
            await page.getByTestId("connections-link").click();

            // Wait for navigation to connections page
            await page.waitForURL("/connections");

            // Verify page heading
            await expect(getPageTitle(page, "Connections")).toBeVisible();

            // Click on add-connection button
            await page.getByTestId("add-connection").click();

            // Verify that add-connection modal appears
            await expect(
                page.getByRole("heading", { name: "Create App Connection" }),
            ).toBeVisible();
        });
    });
});
