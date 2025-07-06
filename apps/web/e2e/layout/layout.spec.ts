import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.goto("/");
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
}) => {
    const sendTransaction = page.getByRole("button", {
        name: "Send Transaction",
    });
    await expect(sendTransaction).toBeDisabled();

    await expect(sendTransaction).toBeVisible();
});

test("should have an enabled button to connect to a wallet", async ({
    page,
}) => {
    const connectWallet = page.getByRole("button", {
        name: "Connect Wallet",
    });

    await expect(connectWallet).toBeVisible();
    await expect(connectWallet).toBeEnabled();
});

test("should have a switch for dark and light mode", async ({ page }) => {
    const switchBtn = page.getByTestId("theme-mode-switch");

    await expect(switchBtn).toContainText("Light Mode");

    await switchBtn.click();

    await expect(switchBtn).toContainText("Dark Mode");
});

test.describe("mobile", () => {
    test("should have a visible and disabled send transaction", async ({
        page,
    }) => {
        const burgerBtn = page.getByTestId("burger-menu-btn");
        await expect(burgerBtn).toBeVisible();
        await burgerBtn.click();
        const sendTransaction = page.getByTestId("menu-item-send-transaction");
        await expect(sendTransaction).toHaveAttribute("data-disabled", "true");

        await expect(sendTransaction).toBeVisible();
    });

    test("should have an enabled button to connect to a wallet", async ({
        page,
    }) => {
        const burgerBtn = page.getByTestId("burger-menu-btn");
        await expect(burgerBtn).toBeVisible();
        await burgerBtn.click();

        const connectWallet = page.getByRole("button", {
            name: "Connect Wallet",
        });

        await expect(connectWallet).toBeVisible();
        await expect(connectWallet).toBeEnabled();
    });
});
