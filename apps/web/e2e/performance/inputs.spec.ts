import { expect, test } from "@playwright/test";
import {
    findGraphQlPaginatedRequest,
    findGraphQlRequest,
} from "../utils/requests";

const maxAllowedRequestTime = 0.5;

test.beforeEach(async ({ page }) => {
    await page.goto("/inputs");
});

test("inputs should load normally", async ({ page }) => {
    // Wait for the initial inputs request
    const inputsRequest = page.waitForRequest(findGraphQlRequest);
    await inputsRequest;

    // Wait for the spinner to disappear
    await expect(page.getByTestId("inputs-table-spinner")).not.toBeVisible();

    // Get the top pagination buttons
    const topPagination = page.getByTestId("top-pagination");
    const paginationButtons = topPagination.getByRole("button");
    // Get the numbered buttons from 2 to 5
    const buttonsForPagesTwoToFive = await paginationButtons
        .filter({ hasText: /^[2-5]$/ })
        .all();

    // Set initial value for the after param
    let after = 10;

    // Iterate the buttons from 2 to 5
    for (const button of buttonsForPagesTwoToFive) {
        // Intercept the paginated request associated with the button
        const paginatedRequest = page.waitForRequest((request) =>
            findGraphQlPaginatedRequest(request, after),
        );

        // Trigger the request by clicking on the button
        await button.click();
        // Measure the start time of the request
        const startTime = Date.now();
        // Await the request to settle
        const request = await paginatedRequest;
        // Await the response
        const response = await request.response();
        // Assert that the request is successful
        expect(response?.status()).toBe(200);
        // Measure the end time of the request
        const endTime = Date.now();
        // Measure the request time
        const requestTime = (endTime - startTime) / 1000;
        // Expect the request to have taken no more than 0.5 seconds
        expect(requestTime).toBeLessThanOrEqual(maxAllowedRequestTime);
        // Iterate the after param for the next request
        after += 10;
    }
});
