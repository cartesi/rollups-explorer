import { Page, Route, test as baseTest } from "@playwright/test";

/**
 * For validations purposes if needed. e.g. check if API
 * was called correctly.
 */
type CalledWith = Record<string, unknown>;

/**
 * Function to register as an interceptor.
 * Interceptions are per-operation, so multiple can be registered without the risk
 * of overwriting one another.
 * @param page {Page} playwright page client.
 * @param operationName Graphql operation name.
 * @param resp The expected return for the mock.
 * @returns
 */
export async function interceptGQL(
    page: Page,
    operationName: string,
    resp: Record<string, unknown>,
): Promise<CalledWith[]> {
    const reqs: CalledWith[] = [];

    await page.route("**/graphql", function (route: Route) {
        const req = route.request().postDataJSON();

        // Pass along to the previous handler in case the operation does not match.
        if (req.operationName !== operationName) {
            return route.fallback();
        }

        // Store what variables the API was called with;
        reqs.push(req.variables);

        return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ data: resp }),
        });
    });

    return reqs;
}

export const test = baseTest.extend<{ interceptGQL: typeof interceptGQL }>({
    interceptGQL: async ({ browser }, use) => {
        await use(interceptGQL);
    },
});
