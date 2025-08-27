import { expect, test } from "@playwright/test";
import { honeypotV2Sepolia } from "../utils/constants";
import { findApplicationsRequestForRollupsV2 } from "../utils/requests";

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
    await expect(page.getByTestId("table-spinner")).not.toBeVisible();
    const applicationSummaryLinks = page.getByTestId(
        "applications-summary-link",
    );

    const firstLink = applicationSummaryLinks.first();
    const href = (await firstLink.getAttribute("href")) as string;

    await firstLink.click();
    await page.waitForURL(href);
});

test("should open application inputs page", async ({ page }) => {
    await expect(page.getByTestId("table-spinner")).not.toBeVisible();
    const applicationInputsLinks = page.getByTestId("applications-link");

    const firstLink = applicationInputsLinks.first();
    const href = (await firstLink.getAttribute("href")) as string;

    await firstLink.click();
    await page.waitForURL(href);
});

test("should open add-connection modal", async ({ page }) => {
    await expect(page.getByTestId("table-spinner")).not.toBeVisible();
    const addConnectionButton = page.getByTestId("add-connection");

    const firstButton = addConnectionButton.first();

    await firstButton.click();
    await expect(page.getByText("Create App Connection")).toBeVisible();
});

test("should search for specific application", async ({ page }) => {
    await expect(page.getByTestId("table-spinner")).not.toBeVisible();

    const search = page.getByTestId("search-input");
    await search.focus();
    await page.keyboard.type(honeypotV2Sepolia.address);
    await page.waitForTimeout(2000);

    await expect(page.getByText("inputs-table-spinner")).not.toBeVisible();
    await expect(page.getByRole("row", { name: "Id Owner URL" })).toBeVisible();
    await expect(page.getByRole("row")).toHaveCount(2);
});

test("should filter applications based on rollups v2 version", async ({
    page,
}) => {
    const rollupsVersionV2Request = page.waitForRequest(
        findApplicationsRequestForRollupsV2,
    );

    await expect(page.getByTestId("table-spinner")).not.toBeVisible();

    const versionsFilterTrigger = page.getByTestId("versions-filter-trigger");
    await versionsFilterTrigger.click();

    const v1MenuItem = page.getByText("Rollups v2");
    await v1MenuItem.click();

    const applyButton = page.getByText("Apply");
    await applyButton.click();

    await rollupsVersionV2Request;

    await expect(page.getByTestId("table-spinner")).not.toBeVisible();

    const applicationBadges = await page
        .getByTestId("rollup-version-badge")
        .all();

    for (const applicationBadge of applicationBadges) {
        const textContent = await applicationBadge.textContent();
        expect(textContent).toBe("v2");
    }
});

test("should filter applications based on multiple version", async ({
    page,
}) => {
    await page.goto("/applications?version=v1%2Cv2");
    await expect(page.getByTestId("table-spinner")).not.toBeVisible();

    const versionsFilterTrigger = page.getByTestId("versions-filter-trigger");
    await versionsFilterTrigger.click();

    const v1MenuItem = page
        .getByTestId("rollups-v1")
        .locator('[data-checked="true"]');
    await expect(v1MenuItem).toBeVisible();

    const v2MenuItem = page
        .getByTestId("rollups-v2")
        .locator('[data-checked="true"]');
    await expect(v2MenuItem).toBeVisible();
});
