import { expect } from "@playwright/test";
import { allOperations } from "@cartesi/rollups-explorer-domain/rollups-operations";
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

test("should have empty label and a create connection button", async ({
    page,
}) => {
    await expect(page.getByText("No Connections Found!")).toBeVisible();
    await expect(page.getByText("Create a connection")).toBeVisible();
});

test("should be able to add a connection", async ({ page }) => {
    await createConnection(page, "0x60a7048c3136293071605a4eaffef49923e981cc");
});

test("should display a confirmation modal for removing a connection", async ({
    page,
}) => {
    await createConnection(page, "0x60a7048c3136293071605a4eaffef49923e981cc");

    const deleteButton = page.getByTestId("remove-connection");
    await deleteButton.click();

    await expect(page.getByText("Delete connection?")).toBeVisible();
    await expect(
        page.getByText(
            "This will delete the data for this connection. Are you sure you want to proceed?",
        ),
    ).toBeVisible();
});

test("should close the confirmation modal when canceling the connection deletion", async ({
    page,
}) => {
    await createConnection(page, "0x60a7048c3136293071605a4eaffef49923e981cc");

    const deleteButton = page.getByTestId("remove-connection");
    await deleteButton.click();

    await expect(page.getByText("Delete connection?")).toBeVisible();
    await expect(
        page.getByText(
            "This will delete the data for this connection. Are you sure you want to proceed?",
        ),
    ).toBeVisible();

    const cancelButton = page.getByText("Cancel");
    await cancelButton.click();

    await expect(page.getByText("Delete connection?")).not.toBeVisible();
    await expect(page.getByText("No connections found.")).not.toBeVisible();
});

test("should remove the connection when the delete action was confirmed", async ({
    page,
}) => {
    await createConnection(page, "0x60a7048c3136293071605a4eaffef49923e981cc");

    const deleteButton = page.getByTestId("remove-connection");
    await deleteButton.click();

    await expect(page.getByText("Delete connection?")).toBeVisible();
    await expect(
        page.getByText(
            "This will delete the data for this connection. Are you sure you want to proceed?",
        ),
    ).toBeVisible();

    const cancelButton = page.getByText("Confirm");
    await cancelButton.click();

    await expect(page.getByText("Delete connection?")).not.toBeVisible();
    await expect(page.getByText("No Connections Found!")).toBeVisible();
});

test("should display correct list with connections", async ({ page }) => {
    await createConnection(page, "0x60a7048c3136293071605a4eaffef49923e981cc");
    await createConnection(page, "0x70ac08179605af2d9e75782b8decdd3c22aa4d0c");
    await createConnection(page, "0x71ab24ee3ddb97dc01a161edf64c8d51102b0cd3");

    const connectionCards = page.getByTestId("connection-card");
    const connectionCardsCount = await connectionCards.count();

    expect(connectionCardsCount).toBe(3);
});
