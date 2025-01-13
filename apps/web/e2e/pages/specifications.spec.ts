import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.goto("/specifications");
});

test("should have correct page title", async ({ page }) => {
    await expect(page).toHaveTitle(/Specifications \| CartesiScan/);
});

test("should have correct title", async ({ page }) => {
    const title = page.getByRole("heading", { name: "Specifications" });
    await expect(title.first()).toBeVisible();
});

test("should display empty state", async ({ page }) => {
    await expect(page.getByText("No Specifications Found!")).toBeVisible();
    await expect(page.getByText("Create one")).toBeVisible();
    await expect(page.getByText("Import specifications")).toBeVisible();
});

test("should open file chooser when 'Import Specifications' is clicked", async ({
    page,
}) => {
    const importSpecificationsButton = page.getByText("Import specifications");
    await expect(importSpecificationsButton).toBeVisible();

    const fileChooserPromise = page.waitForEvent("filechooser");
    await importSpecificationsButton.click();

    const fileChooser = await fileChooserPromise;

    expect(fileChooser.isMultiple()).toBe(false);
});
