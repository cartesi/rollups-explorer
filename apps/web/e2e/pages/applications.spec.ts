import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.goto("/applications");
});

test("should have correct page title", async ({ page }) => {
    await expect(page).toHaveTitle(/Applications \| CartesiScan/);
});

test("should have correct title", async ({ page }) => {
    const title = page.getByRole("heading", { name: "Applications" });
    await expect(title.first()).toBeVisible();
});

test("should display 'All applications' table", async ({ page }) => {
    await expect(page.getByRole("row", { name: "Id Owner URL" })).toBeVisible();
    await expect(page.getByRole("row")).toHaveCount(11);
});

test("should display correct tabs", async ({ page }) => {
    await expect(page.getByText("All apps")).toBeVisible();
    await expect(page.getByText("My apps")).toBeVisible();
});

test('should display empty state when "My apps" tab is active', async ({
    page,
}) => {
    const myAppsTab = page.getByText("My apps");
    await myAppsTab.click();

    await expect(
        page.getByText("Connect your wallet to list your Applications"),
    ).toBeVisible();
});

test("should open application summary page", async ({ page }) => {
    await expect(page.getByTestId("applications-spinner")).not.toBeVisible();
    const applicationSummaryLinks = await page.getByTestId(
        "applications-summary-link",
    );

    const firstLink = applicationSummaryLinks.first();
    const href = (await firstLink.getAttribute("href")) as string;

    await firstLink.click();
    await page.waitForURL(href);
});

test("should open application inputs page", async ({ page }) => {
    await expect(page.getByTestId("applications-spinner")).not.toBeVisible();
    const applicationInputsLinks = await page.getByTestId("applications-link");

    const firstLink = applicationInputsLinks.first();
    const href = (await firstLink.getAttribute("href")) as string;

    await firstLink.click();
    await page.waitForURL(href);
});

test("should open add-connection modal", async ({ page }) => {
    await expect(page.getByTestId("applications-spinner")).not.toBeVisible();
    const addConnectionButton = await page.getByTestId("add-connection");

    const firstButton = addConnectionButton.first();

    await firstButton.click();
    await expect(page.getByText("Create App Connection")).toBeVisible();
});
