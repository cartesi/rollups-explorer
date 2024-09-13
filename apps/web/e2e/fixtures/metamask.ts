import type { BrowserContext } from "@playwright/test";
import { chromium, test as baseTest } from "@playwright/test";
import { initialSetup } from "@synthetixio/synpress/commands/metamask";
import { prepareMetamask } from "@synthetixio/synpress/helpers";

export const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const vercelBypassToken = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
export const extraHTTPHeaders = vercelBypassToken
    ? { "x-vercel-protection-bypass": vercelBypassToken }
    : undefined;

export const test = baseTest.extend<{
    context: BrowserContext;
}>({
    context: async ({}, use) => {
        // Required for SynPress
        // @ts-ignore
        global.expect = baseTest.expect;

        // Download Metamask
        const metamaskVersion = "11.15.1";
        const metamaskPath = await prepareMetamask(metamaskVersion);

        // Prepare browser args
        const browserArgs = [
            `--disable-extensions-except=${metamaskPath}`,
            `--load-extension=${metamaskPath}`,
            "--remote-debugging-port=9222",
        ];

        // Launch browser
        const context = await chromium.launchPersistentContext("", {
            baseURL: BASE_URL,
            headless: false,
            args: browserArgs,
            extraHTTPHeaders
        });

        // Wait for Metamask window to be shown.
        await context.pages()[0].waitForTimeout(3000);

        // Setup metamask
        await initialSetup(chromium, {
            secretWordsOrPrivateKey:
                "test test test test test test test test test test test junk",
            network: "sepolia",
            password: "Tester@1234",
            enableAdvancedSettings: true,
        });

        // Provide context
        await use(context);
    },
});
