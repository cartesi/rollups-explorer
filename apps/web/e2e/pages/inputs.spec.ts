import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.goto("inputs");
});

test("should have correct page title", async ({ page }) => {
    await expect(page).toHaveTitle(/Inputs \| CartesiScan/);
});

test("should have correct title", async ({ page }) => {
    const title = page.getByRole("heading", { name: "Inputs" });
    await expect(title.first()).toBeVisible();
});

test("should display 'All inputs' table", async ({ page }) => {
    await expect(
        page.getByRole("row", {
            name: "From To Version Method Index Status Age Data",
        }),
    ).toBeVisible();
    await expect(page.getByRole("row")).toHaveCount(31);
});

test("should open application inputs page", async ({ page }) => {
    await expect(page.getByTestId("inputs-table-spinner")).not.toBeVisible();
    const applicationSummaryLinks = page
        .getByTestId("application-inputs-link")
        .getByRole("link");

    const firstLink = applicationSummaryLinks.first();
    const href = (await firstLink.getAttribute("href")) as string;
    const appVersioned = href
        .split(/applications|inputs|\//)
        .filter((p) => p !== "")
        .join("/");

    await firstLink.click();

    await page.waitForURL(`/applications/${appVersioned}/inputs`);
});

test("should open input details", async ({ page }) => {
    await expect(page.getByTestId("inputs-table-spinner")).not.toBeVisible();
    const inputRowToggle = page.getByTestId("input-row-toggle");

    const firstInputRowToggle = inputRowToggle.first();
    await firstInputRowToggle.click();
    await expect(page.getByText("Notices")).toBeVisible();
    await expect(page.getByText("Reports")).toBeVisible();
    await expect(page.getByText("Vouchers")).toBeVisible();
    await expect(page.getByText("Raw")).toBeVisible();
    await expect(page.getByText("As Text")).toBeVisible();
    await expect(page.getByText("As JSON")).toBeVisible();
});

test("should search for specific input", async ({ page }) => {
    await expect(page.getByTestId("inputs-table-spinner")).not.toBeVisible();
    let fromAddress = page
        .getByTestId("application-from-address")
        .getByRole("paragraph");

    const firstLink = fromAddress.first();
    const href = (await firstLink.textContent()) as string;
    const [addressPrefix] = href.split("...");

    const search = page.getByTestId("search-input");
    await search.focus();
    await page.keyboard.type(addressPrefix);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(2000);

    await expect(page.getByText("inputs-table-spinner")).not.toBeVisible();

    fromAddress = page
        .getByTestId("application-from-address")
        .getByRole("paragraph");

    const addresses = await fromAddress.all();

    for (const address of addresses) {
        const linkHref = (await address.textContent()) as string;

        expect(
            linkHref.toLowerCase().startsWith(addressPrefix.toLowerCase()),
        ).toBe(true);
    }
});
