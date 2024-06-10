import { expect } from "@playwright/test";
import { Address } from "viem";
import { allOperations } from "../../src/graphql/rollups/operations";
import { test } from "../fixtures/test";
import { checkStatusSuccessResponse } from "../utils/checkStatus.data";
import { createConnection } from "../utils/connection";

test.beforeEach(async ({ page, interceptGQL }) => {
    await page.goto("/connections");
    await interceptGQL(
        page,
        allOperations.Query.checkStatus,
        checkStatusSuccessResponse,
    );
});

test("should have correct page title", async ({ page }) => {
    await expect(page).toHaveTitle(/Connections \| CartesiScan/);
});

test("should have correct title", async ({ page }) => {
    const title = page.getByRole("heading", { name: "Connections" });
    await expect(title.first()).toBeVisible();
});

test("should have empty label", async ({ page }) => {
    await expect(page.getByText("No connections found.")).toBeVisible();
});

test("should be able to add a connection", async ({ page }) => {
    await createConnection(page, "0x60a7048c3136293071605a4eaffef49923e981cc");
});

test("should be able to remove a connection", async ({ page }) => {
    await createConnection(page, "0x60a7048c3136293071605a4eaffef49923e981cc");

    const deleteButton = page.getByTestId("remove-connection");
    await deleteButton.click();

    await expect(page.getByText("No connections found.")).toBeVisible();
});

// TODO: This test is failing in CI, so let's comment it out until we implement the e2e step as part of the build and then we'll revisit it
test("should display correct list with connections", async ({ page }) => {
    const addresses: Address[] = [
        "0x60a7048c3136293071605a4eaffef49923e981cc",
        "0x70ac08179605af2d9e75782b8decdd3c22aa4d0c",
    ];
    await Promise.all(
        addresses.map(async (address) => await createConnection(page, address)),
    );

    const connectionCards = page.getByTestId("connection-card");
    const connectionCardsCount = await connectionCards.count();

    expect(connectionCardsCount).toBe(addresses.length);
});
