import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.goto("/inputs");
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
            name: "Transaction Hash From To Version Method Index Status Age Data",
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

test("should filter inputs based on rollups v2 version", async ({ page }) => {
    await expect(page.getByTestId("inputs-table-spinner")).not.toBeVisible();

    const versionsFilterTrigger = page.getByTestId("versions-filter-trigger");
    await versionsFilterTrigger.click();

    const v1MenuItem = page.getByText("Rollups v2");
    await v1MenuItem.click();

    const applyButton = page.getByText("Apply");
    await applyButton.click();

    await page.waitForURL("/inputs", {
        waitUntil: "networkidle",
    });

    await expect(page.getByTestId("inputs-table-spinner")).not.toBeVisible();

    const href = await page.evaluate(() => document.location.search, {
        timeout: 1000,
    });
    expect(href).toContain("version=v2");
});

test("should filter applications based on multiple version", async ({
    page,
}) => {
    await page.goto("/inputs?version=v1%2Cv2");
    await expect(page.getByTestId("inputs-table-spinner")).not.toBeVisible();

    const versionsFilterTrigger = page.getByTestId("versions-filter-trigger");
    await versionsFilterTrigger.click();

    const v1MenuItem = page
        .getByTestId("rollups-v1")
        .locator('[data-checked="true"]');
    await expect(v1MenuItem).toBeVisible();

    const v2MenuItem = page
        .getByTestId("rollups-v2")
        .locator('[data-checked="true"]');
    await expect(v2MenuItem).toBeVisible();
});
