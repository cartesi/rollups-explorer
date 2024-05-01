import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.goto("/");
});

test("should display latest inputs section", async ({ page }) => {
    // Find latest inputs section
    const latestInputsSection = page.getByTestId("latest-inputs");

    // Wait for the section to be visible
    await expect(latestInputsSection).toBeVisible();

    // Verify section title
    await expect(latestInputsSection.getByText("Latest inputs")).toBeVisible();

    // Verify that table with correct columns is visible
    await expect(
        latestInputsSection.getByRole("row", { name: "Address Age" }).first(),
    ).toBeVisible();

    // Find "View all inputs" link
    const viewAllLink = latestInputsSection.getByText("View all inputs");
    await expect(viewAllLink).toBeVisible();

    // Click the link
    await viewAllLink.click();

    // Verify navigation to inputs page
    await page.waitForURL("/inputs");
});

test("should display latest applications section", async ({ page }) => {
    // Find latest applications section
    const latestApplicationsSection = page.getByTestId("latest-applications");

    // Wait for the section to be visible
    await expect(latestApplicationsSection).toBeVisible();

    // Verify section title
    await expect(
        latestApplicationsSection.getByText("Latest applications"),
    ).toBeVisible();

    // Verify that table with correct columns is visible
    await expect(
        latestApplicationsSection
            .getByRole("row", { name: "Address Age" })
            .first(),
    ).toBeVisible();

    // Find "View all applications" link
    const viewAllLink = latestApplicationsSection.getByText(
        "View all applications",
    );
    await expect(viewAllLink).toBeVisible();

    // Click the link
    await viewAllLink.click();

    // Verify navigation to applications page
    await page.waitForURL("/applications");
});

test("should display inputs summary", async ({ page }) => {
    // Find entries summary section
    const entriesSummarySection = page.getByTestId("entries-summary");

    // Wait for the section to be visible
    await expect(entriesSummarySection).toBeVisible();

    // Verify section title
    await expect(entriesSummarySection.getByText("Inputs")).toBeVisible();
});

test("should display applications summary", async ({ page }) => {
    // Find entries summary section
    const entriesSummarySection = page.getByTestId("entries-summary");

    // Wait for the section to be visible
    await expect(entriesSummarySection).toBeVisible();

    // Verify section title
    await expect(entriesSummarySection.getByText("Applications")).toBeVisible();
});
