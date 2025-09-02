import { expect, test } from "@playwright/test";
import {
    findGraphQlPaginatedRequest,
    findGraphQlRequest,
} from "../utils/requests";

test.beforeEach(async ({ page }) => {
    await page.goto("/inputs");
});

test("inputs should load normally", async ({ page }) => {
    // Wait for the initial inputs request
    await page.waitForRequest(findGraphQlRequest);

    // Wait for the spinner to disappear
    await expect(page.getByTestId("inputs-table-spinner")).not.toBeVisible();

    // Get the top pagination buttons
    const topPagination = page.getByTestId("top-pagination");
    const paginationButtons = topPagination.getByRole("button");
    // Get the numbered buttons from 2 to 5
    const buttonsForPagesTwoToFour = await paginationButtons
        .filter({ hasText: /^[2-5]$/ })
        .all();

    // Set initial value for the after param
    let after = 10;

    // Iterate the buttons from 2 to 5
    for (const button of buttonsForPagesTwoToFour) {
        // Intercept the paginated request associated with the button
        const paginatedRequest = page.waitForRequest((request) =>
            findGraphQlPaginatedRequest(request, after),
        );

        // Trigger the request by clicking on the button
        await button.click();
        // Measure the start time of the request
        const startTime = Date.now();
        // Await the request to settle
        await paginatedRequest;
        // Await the table spinner to be visible
        await expect(page.getByTestId("inputs-table-spinner")).toBeVisible();
        // Await the table spinner to be hidden
        await expect(page.getByTestId("inputs-table-spinner")).not.toBeVisible({
            timeout: 1000,
        });
        // Iterate the after param for the next request
        after += 10;
    }
});

test("cache should be used for the same requests", async ({ page }) => {
    // Wait for the initial inputs request
    await page.waitForRequest(findGraphQlRequest);

    // Wait for the spinner to disappear
    await expect(page.getByTestId("inputs-table-spinner")).not.toBeVisible();

    // Get the top pagination buttons
    const topPagination = page.getByTestId("top-pagination");
    const paginationButtons = topPagination.getByRole("button");
    // Get the numbered buttons from 2 to 5
    const buttonsForPagesTwoToFour = await paginationButtons
        .filter({ hasText: /^[2-4]$/ })
        .all();

    // Set initial value for the after param
    let after = 10;

    // Iterate the buttons from 2 to 4
    for (const button of buttonsForPagesTwoToFour) {
        // Intercept the paginated request associated with the button
        const paginatedRequest = page.waitForRequest(
            (request) => findGraphQlPaginatedRequest(request, after),
            { timeout: 1000 },
        );

        // Trigger the request by clicking on the button
        await button.click();
        // Await the request to settle
        const request = await paginatedRequest;
        // Await the response
        const response = await request.response();
        // Assert that the request is successful
        expect(response?.status()).toBe(200);
        // Iterate the after param for the next request
        after += 10;
    }

    // Reset the after value
    after = 0;

    // Set the initial flag for verifying if any subsequent requests were made
    let paginatedRequestWasMade = false;

    // Listen for requests and set the flag to true if any graphql requests are made
    page.on("request", (request) => {
        if (request.url().includes("/graphql")) {
            paginatedRequestWasMade = true;
        }
    });

    // Get the numbered buttons from 2 to 5
    const buttonsForPagesOneToFour = await paginationButtons
        .filter({ hasText: /^[1-4]$/ })
        .all();

    // Iterate the buttons from 1 to 5
    for (const button of buttonsForPagesOneToFour) {
        // Click on the pagination button
        await button.click();
        // Verify that the table spinner doesn't appear
        await expect(
            page.getByTestId("inputs-table-spinner"),
        ).not.toBeVisible();
        // Await all requests to settle
        await page.waitForLoadState("networkidle");
        // Iterate the after param for the next request
        after += 10;
    }

    // Verify that no paginated requests were made
    expect(paginatedRequestWasMade).toBe(false);
});
