import { expect, Page } from "@playwright/test";

export const goToApplicationInputsPage = async ({ page }: { page: Page }) => {
    // Go to applications page
    await page.goto("/");

    // Wait for applications data to be loaded
    await expect(
        page.getByTestId("inputs-table-spinner").first(),
    ).not.toBeVisible();

    // Get the first link from the latest inputs table
    const latestInputsTableFirstLink = page
        .getByTestId("latest-inputs")
        .getByRole("table")
        .getByRole("link")
        .first();

    await latestInputsTableFirstLink.click();
};

export const goToApplicationSummaryPage = async ({ page }: { page: Page }) => {
    // Go to applications page
    await page.goto("/");

    // Wait for applications data to be loaded
    await expect(
        page.getByTestId("inputs-table-spinner").first(),
    ).not.toBeVisible();

    // Get the first link from the latest inputs table
    const latestInputsTableFirstLink = page
        .getByTestId("latest-inputs")
        .getByRole("table")
        .getByRole("link")
        .first();

    const href = await latestInputsTableFirstLink.getAttribute("href");

    const summaryHref = href?.replace("/inputs", "");

    expect(summaryHref).toBeDefined();

    // navigate to the href
    await page.goto(summaryHref as string);
};
