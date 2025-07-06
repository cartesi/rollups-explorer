import { expect, Page } from "@playwright/test";
import { Address } from "viem";

export const graphqlEndpoint = "https://drawingcanvas.fly.dev/graphql";

export const createConnection = async (
    page: Page,
    address: Address,
    url = graphqlEndpoint,
    shouldTypeAddress = true,
) => {
    // Find and click the button for displaying the connection modal
    const button = page.getByTestId("add-connection");
    await button.click();

    // Wait for the modal to appear
    await expect(page.getByText("Create App Connection")).toBeVisible();

    // Fill in the address
    if (shouldTypeAddress) {
        const addressInput = page.getByTestId("connection-address");
        await addressInput.focus();
        await page.keyboard.type(address);
    }

    // Fill in the url
    const urlInput = page.getByTestId("connection-url");
    await urlInput.focus();
    await page.keyboard.type(url);

    // Wait for the success notification to appear (this notification verifies that the url is valid)
    await expect(
        page.getByText("This application responded with"),
    ).toBeVisible();

    // Submit the form
    await page.keyboard.press("Enter");

    // Wait for the success alert to appear
    await expect(
        page.getByText(`Connection ${address} created with success`),
    ).toBeVisible();
};
