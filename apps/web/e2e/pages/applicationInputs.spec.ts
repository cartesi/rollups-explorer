import { expect, Page, test } from "@playwright/test";

const goToApplicationInputsPage = async (page: Page) => {
    await page.goto("/applications");

    await expect(page.getByTestId("applications-spinner")).not.toBeVisible();
    const applicationInputsLinks = page
        .getByTestId("applications-table")
        .getByTestId("applications-link");

    const firstLink = applicationInputsLinks.first();
    const href = (await firstLink.getAttribute("href")) as string;

    await page.goto(href);
};

test.beforeEach(async ({ page }) => {
    await goToApplicationInputsPage(page);
});

test("should have correct page title", async ({ page }) => {
    const pageUrl = page.url();
    const [, address] = pageUrl.split("/").reverse();

    await expect(page).toHaveTitle(`Application ${address} | CartesiScan`);
});

test("should have correct title", async ({ page }) => {
    const title = page.getByRole("heading", { name: "Inputs" });
    await expect(title.first()).toBeVisible();
});

test("should display inputs table", async ({ page }) => {
    await expect(
        page.getByRole("row", { name: "From To Method Index Age Data" }),
    ).toBeVisible();
    await expect(page.getByRole("row")).toHaveCount(31);
});

test("should toggle date column", async ({ page }) => {
    const ageHeaderColumn = page.getByText("Age");
    await ageHeaderColumn.click();

    await expect(
        page.getByRole("row", {
            name: "From To Method Index Timestamp (UTC) Data",
        }),
    ).toBeVisible();

    const timestampHeaderColumn = page.getByText("Timestamp (UTC)");
    await timestampHeaderColumn.click();

    await expect(
        page.getByRole("row", { name: "From To Method Index Age Data" }),
    ).toBeVisible();
});

test("should open input details", async ({ page }) => {
    await expect(page.getByTestId("inputs-table-spinner")).not.toBeVisible();
    const inputRowToggle = await page.getByTestId("input-row-toggle");

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

    const search = await page.getByTestId("search-input");
    await search.focus();
    await page.keyboard.type(addressPrefix);
    await page.keyboard.press("Enter");

    // The search input is debounced, with a delay of 500 ms
    await page.waitForTimeout(500);

    await expect(page.getByTestId("inputs-table-spinner")).toBeVisible();
    await expect(page.getByTestId("inputs-table-spinner")).not.toBeVisible();

    fromAddress = page
        .getByTestId("application-from-address")
        .getByRole("paragraph");

    const addresses = await fromAddress.all();
    addresses.map(async (address) => {
        const linkHref = (await address.textContent()) as string;

        expect(
            linkHref.toLowerCase().startsWith(addressPrefix.toLowerCase()),
        ).toBe(true);
    });
});
