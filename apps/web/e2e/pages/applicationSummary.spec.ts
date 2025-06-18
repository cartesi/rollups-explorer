import { expect } from "@playwright/test";
import { test } from "../fixtures/test";
import { checkStatusSuccessResponse } from "../utils/checkStatus.data";
import { createConnection, graphqlEndpoint } from "../utils/connection";
import { honeypotV2Sepolia } from "../utils/constants";

test.beforeEach(async ({ page, interceptGQL }) => {
    // TODO: Update to use upcoming search in the applications page rather than navigate directly.
    await page.goto(
        `/applications/${honeypotV2Sepolia.address}/${honeypotV2Sepolia.rollupsVersion}`,
    );
    await interceptGQL(page, "checkStatus", checkStatusSuccessResponse);
});

test("should have correct page title", async ({ page }) => {
    const [_version, address] = page.url().split("/").reverse();
    await expect(page).toHaveTitle(`Application ${address} | CartesiScan`);
});

test("should have correct title", async ({ page }) => {
    const title = page.getByRole("heading", { name: "Summary" });
    await expect(title.first()).toBeVisible();
});

test("should display latest inputs table", async ({ page }) => {
    await expect(
        page.getByRole("row", { name: "From Method Age" }),
    ).toBeVisible();
    const rowsCount = await page.getByRole("row").count();
    expect(rowsCount > 2);
});

test("should toggle date column", async ({ page }) => {
    const ageHeaderColumn = page.getByText("Age");
    await ageHeaderColumn.click();

    await expect(
        page.getByRole("row", {
            name: "From Method Timestamp (UTC)",
        }),
    ).toBeVisible();

    const timestampHeaderColumn = page.getByText("Timestamp (UTC)");
    await timestampHeaderColumn.click();

    await expect(
        page.getByRole("row", { name: "From Method Age" }),
    ).toBeVisible();
});

test("should navigate to application inputs page", async ({ page }) => {
    const [version, address] = page.url().split("/").reverse();
    await page.getByText("View inputs").click();
    await page.waitForURL(`/applications/${address}/${version}/inputs`);
});

test("should display summary skeleton cards", async ({ page }) => {
    await expect(page.getByTestId("skeleton")).toBeVisible();
    await expect(page.getByText("Add connection")).toBeVisible();
});

test("should be able to add a connection from application summary page", async ({
    page,
}) => {
    const [_version, address] = page.url().split("/").reverse();
    await createConnection(
        page,
        address as `0x${string}`,
        graphqlEndpoint,
        false,
    );
    await expect(page.getByText("Notices")).toBeVisible();
    await expect(page.getByText("Vouchers")).toBeVisible();
    await expect(page.getByText("Reports")).toBeVisible();
});
