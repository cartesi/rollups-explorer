import { expect, test } from "@playwright/test";
import { honeypotV2Sepolia } from "../utils/constants";

test.beforeEach(async ({ page }) => {
    // TODO: Update to use upcoming search in the applications page rather than navigate directly.
    await page.goto(
        `/applications/${honeypotV2Sepolia.address}/${honeypotV2Sepolia.rollupsVersion}/inputs`,
    );
});

test("should have correct page title", async ({ page }) => {
    const [_page, _version, address] = page.url().split("/").reverse();
    await expect(page).toHaveTitle(`Application ${address} | CartesiScan`);
});

test("should have correct title", async ({ page }) => {
    const title = page.getByRole("heading", { name: "Inputs" });
    await expect(title.first()).toBeVisible();
});

test("should display inputs table", async ({ page }) => {
    await expect(
        page.getByRole("row", {
            name: "Transaction Hash From To Version Method Index Status Age Data",
        }),
    ).toBeVisible();

    await expect(page.getByTestId("inputs-table-spinner")).not.toBeVisible();

    const rowsCount = await page.locator(".mantine-Table-tbody > tr").count();
    expect(rowsCount).toBeGreaterThan(1);
});

test("should toggle date column", async ({ page }) => {
    const ageHeaderColumn = page.getByText("Age").first();
    await ageHeaderColumn.click();

    await expect(
        page.getByRole("row", {
            name: "From To Version Method Index Status Timestamp (UTC) Data",
        }),
    ).toBeVisible();

    const timestampHeaderColumn = page.getByText("Timestamp (UTC)");
    await timestampHeaderColumn.click();

    await expect(
        page.getByRole("row", {
            name: "Transaction Hash From To Version Method Index Status Age Data",
        }),
    ).toBeVisible();
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

    // The search input is debounced, with a delay of 500 ms
    await page.waitForTimeout(500);

    await expect(page.getByTestId("inputs-table-spinner")).toBeVisible();
    await expect(page.getByTestId("inputs-table-spinner")).not.toBeVisible();

    fromAddress = page
        .getByTestId("application-from-address")
        .getByRole("paragraph");

    const addresses = await fromAddress.all();

    for (const address of addresses) {
        const linkHref = (await address.textContent()) as string;
        expect(linkHref.toLowerCase()).toContain(addressPrefix.toLowerCase());
    }
});
