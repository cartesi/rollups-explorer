import { BrowserContext, test as baseTest } from "@playwright/test";
import dappwright, { Dappwright, MetaMaskWallet } from "@tenkeylabs/dappwright";

export const test = baseTest.extend<{
    context: BrowserContext;
    wallet: Dappwright;
}>({
    context: async ({}, use) => {
        // Launch context with extension
        const [wallet, _, context] = await dappwright.bootstrap("", {
            wallet: "metamask",
            version: MetaMaskWallet.recommendedVersion,
            seed: "test test test test test test test test test test test junk", // Hardhat's default https://hardhat.org/hardhat-network/docs/reference#accounts
            headless: false,
            showTestNets: true,
        });

        await wallet.switchNetwork("Sepolia");

        await use(context);
    },

    wallet: async ({ context }, use) => {
        const metamask = await dappwright.getWallet("metamask", context);
        await use(metamask);
    },
});
