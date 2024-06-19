import { defineConfig, devices } from "@playwright/test";

const BASE_URL = process.env.CI
    ? process.env.VERCEL_URL ?? "https://sepolia.cartesiscan.io/"
    : process.env.E2E_BASE_URL ?? "http://localhost:3000";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    testDir: "./e2e",
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [["list"], ["html", { outputFolder: "playwright-report" }]],
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: BASE_URL,
        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: "on-first-retry",
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: "chromium",
            grepInvert: /mobile/,
            use: { ...devices[""] },
        },
        /* Run your tests on multiple browsers */
        {
            name: "firefox",
            grepInvert: /mobile/,
            use: { ...devices["Desktop Firefox"] },
        },
        {
            name: "webkit",
            grepInvert: /mobile/,
            use: { ...devices["Desktop Safari"] },
        },
        {
            name: "Mobile Safari",
            grep: /mobile/,
            use: { ...devices["iPhone 12"] },
        },
    ],

    /* Run your local dev server before starting the tests */
    // webServer: {
    //     command: "yarn run dev",
    //     url: "http://127.0.0.1:3000",
    //     reuseExistingServer: !process.env.CI,
    //     timeout: 120 * 1000,
    // },
});
