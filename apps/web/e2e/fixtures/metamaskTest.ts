// fixtures.js
import {
    test as base,
    chromium,
    type BrowserContext,
    defineConfig,
    devices,
} from "@playwright/test";
import { initialSetup } from "@synthetixio/synpress/commands/metamask";
import { prepareMetamask } from "@synthetixio/synpress/helpers";

export const test = base.extend<{
    context: BrowserContext;
}>({
    context: async ({}, use) => {
        // Required for synpress
        global.expect = expect;
        // Download metamask
        const metamaskVersion = "11.15.1";
        const metamaskPath = await prepareMetamask(metamaskVersion);

        // Prepare browser args
        const browserArgs = [
            `--disable-extensions-except=${metamaskPath}`,
            `--load-extension=${metamaskPath}`,
            "--remote-debugging-port=9222",
        ];

        if (process.env.CI) {
            browserArgs.push("--disable-gpu");
        }

        if (process.env.HEADLESS_MODE) {
            browserArgs.push("--headless=new");
        }
        // launch browser
        const context = await chromium.launchPersistentContext("", {
            headless: false,
            args: browserArgs,
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
        await use(context);
    },
});

export const expect = test.expect;
export { defineConfig, devices };
