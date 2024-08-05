import { expect, Page } from "@playwright/test";

export const goToApplicationInputsPage = async ({ page }: { page: Page }) => {
    // Go to applications page
    await page.goto("/applications");

    // Wait for applications data to be loaded
    await expect(page.getByTestId("applications-spinner")).not.toBeVisible();

    // Get the applications' links
    const applicationInputsLinks = page
        .getByTestId("applications-table")
        .getByTestId("applications-link");

    // Get the href attribute of the first link (this is the link to that application's inputs page)
    const href = (await applicationInputsLinks
        .first()
        .getAttribute("href")) as string;

    // navigate to the href
    await page.goto(href);
};

export const goToApplicationSummaryPage = async ({ page }: { page: Page }) => {
    // Go to applications page
    await page.goto("/applications");

    // Wait for applications data to be loaded
    await expect(page.getByTestId("applications-spinner")).not.toBeVisible();

    // Get the applications' links
    const applicationInputsLinks = page
        .getByTestId("applications-table")
        .getByTestId("applications-summary-link");

    // Get the href attribute of the first link (this is the link to that application's inputs page)
    const href = (await applicationInputsLinks
        .first()
        .getAttribute("href")) as string;

    // navigate to the href
    await page.goto(href);
};
