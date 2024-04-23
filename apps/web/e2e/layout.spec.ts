import { expect, test } from "@playwright/test";
import e2eConfig from "./config";

const { baseURL } = e2eConfig;

test.beforeEach(async ({ page }) => {
    await page.goto(baseURL);
});

test("should have page title", async ({ page }) => {
    await expect(page).toHaveTitle(/Blockchain Explorer \| CartesiScan/);
});

test("should have a left menu with links", async ({ page }) => {
    await expect(page.getByTestId("home-link")).toHaveText("Home");
    await expect(page.getByTestId("applications-link")).toHaveText(
        "Applications",
    );
    await expect(page.getByTestId("inputs-link")).toHaveText("Inputs");
});

test("should have a visible and disabled send transaction", async ({
    page,
    isMobile,
}) => {
    let sendTransaction;
    if (isMobile) {
        const burgerBtn = page.getByTestId("burger-menu-btn");
        await expect(burgerBtn).toBeVisible();
        await burgerBtn.click();
        sendTransaction = await page.getByTestId("menu-item-send-transaction");
        await expect(sendTransaction).toHaveAttribute("data-disabled", "true");
    } else {
        sendTransaction = await page.getByRole("button", {
            name: "Send Transaction",
        });
        await expect(sendTransaction).toBeDisabled();
    }

    await expect(sendTransaction).toBeVisible();
});

test("should have an enabled button to connect to a wallet", async ({
    page,
    isMobile,
}) => {
    if (isMobile) {
        const burgerBtn = page.getByTestId("burger-menu-btn");
        await expect(burgerBtn).toBeVisible();
        await burgerBtn.click();
    }
    const connectWallet = page.getByRole("button", {
        name: "Connect Wallet",
    });

    await expect(connectWallet).toBeVisible();
    await expect(connectWallet).toBeEnabled();
});

test("should have a switch for dark and light mode", async ({ page }) => {
    const switchBtn = page.getByTestId("theme-mode-switch");

    await expect(switchBtn).toHaveText("Light Mode");

    switchBtn.click();

    await expect(switchBtn).toHaveText("Dark Mode");
});
