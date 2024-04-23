import { expect, test } from "@playwright/test";
import e2eConfig from "./config";

const { baseURL } = e2eConfig;

test.beforeEach(async ({ page }) => {
    await page.goto(baseURL);
});

test.describe("Navigations", () => {
    test("can navigate to applications page", async ({ page, isMobile }) => {
        if (isMobile) {
            const burgerBtn = page.getByTestId("burger-menu-btn");
            await expect(burgerBtn).toBeVisible();
            await burgerBtn.click();
        }

        await page.getByTestId("applications-link").click();
        await page.waitForURL(`${baseURL}/applications`);

        await expect(
            page.getByRole("heading", { name: "Applications" }),
        ).toBeVisible();

        await expect(
            page.getByRole("row", { name: "Id Owner URL" }),
        ).toBeVisible();

        await expect(page.getByRole("row")).toHaveCount(11);
    });

    test("can navigate to inputs page", async ({ page, isMobile }) => {
        if (isMobile) {
            const burgerBtn = page.getByTestId("burger-menu-btn");
            await expect(burgerBtn).toBeVisible();
            await burgerBtn.click();
        }

        await page.getByTestId("inputs-link").click();
        await page.waitForURL(`${baseURL}/inputs`);

        await expect(
            page.getByPlaceholder("Search by Address / Txn Hash / Index"),
        ).toBeVisible();

        await expect(
            page.getByRole("heading", { name: "Inputs" }),
        ).toBeVisible();

        await expect(
            page.getByRole("row", { name: "From To Method Index Age Data" }),
        ).toBeVisible();

        // For each input row it actually inserts 3 <tr>
        await expect(page.getByRole("row")).toHaveCount(31);
    });
});
