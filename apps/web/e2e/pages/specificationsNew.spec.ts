import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.goto("/specifications/new");
});

test("should have correct page title", async ({ page }) => {
    await expect(page).toHaveTitle(/New Specification \| CartesiScan/);
});

test("should have correct title", async ({ page }) => {
    const title = page.getByRole("heading", {
        name: "Create a Specification",
    });
    await expect(title.first()).toBeVisible();
});

test("should create JSON ABI spec", async ({ page }) => {
    const name = "My E2E JSON ABI spec";
    const nameInput = page.getByTestId("specification-name-input");
    await nameInput.focus();
    await page.keyboard.type(name);

    const jsonAbiTextarea = page.getByTestId("human-readable-abi-input");
    await jsonAbiTextarea.focus();

    const jsonAbiSpec =
        "struct User { string name; uint amount; address}\n" +
        "function createAccount(User user, string role)\n" +
        "function deposit(User user, address from, string reason)";
    await page.keyboard.type(jsonAbiSpec);

    const saveButton = page.getByTestId("specification-form-save");
    await saveButton.click();

    await expect(page.getByText(`Specification ${name} Saved!`)).toBeVisible();
    await page.goto("/specifications");
    await expect(page.getByText(name)).toBeVisible();
});

test("should create ABI Parameters spec", async ({ page }) => {
    const abiParametersTab = page.getByText("ABI Parameters");
    await abiParametersTab.click();

    const name = "My ABI Parameters spec";
    const nameInput = page.getByTestId("specification-name-input");
    await nameInput.focus();
    await page.keyboard.type(name);

    const abiParameterInput = page.getByPlaceholder(
        "address to, uint256 amount, bool succ",
    );
    await abiParameterInput.focus();

    const abiParametersSpec =
        "address to, uint256 amount, (uint256 counter, string name) structy";
    await page.keyboard.type(abiParametersSpec);

    const addButton = page.getByTestId("abi-parameter-add-button");
    await addButton.click();

    const saveButton = page.getByTestId("specification-form-save");
    await saveButton.click();

    await expect(page.getByText(`Specification ${name} Saved!`)).toBeVisible();
    await page.goto("/specifications");
    await expect(page.getByText(name)).toBeVisible();
});

test("should validate JSON ABI spec", async ({ page }) => {
    const saveButton = page.getByTestId("specification-form-save");
    await saveButton.click();

    await expect(page.getByText("Name is required.")).toBeVisible();
    await expect(
        page.getByText("The ABI is required on JSON ABI mode."),
    ).toBeVisible();

    const name = "My JSON ABI spec";
    const nameInput = page.getByTestId("specification-name-input");
    await nameInput.focus();
    await page.keyboard.type(name);

    const jsonAbiSpec = "invalid abi spec";
    const jsonAbiTextarea = page.getByTestId("human-readable-abi-input");
    await jsonAbiTextarea.focus();
    await page.keyboard.type(jsonAbiSpec);

    await expect(
        page.getByText(
            `Unknown signature. Details: ${jsonAbiSpec} Version: abitype@1.0.7`,
        ),
    ).toBeVisible();

    await saveButton.click();

    await expect(
        page.getByText("The ABI is required on JSON ABI mode."),
    ).toBeVisible();

    await expect(
        page.getByText(`Specification ${name} Saved!`),
    ).not.toBeVisible({
        timeout: 300,
    });
});

// TODO: Resume using this test after https://github.com/cartesi/rollups-explorer/issues/297 is tackled
test.skip("should validate ABI Parameters spec", async ({ page }) => {
    const abiParametersTab = page.getByText("ABI Parameters");
    await abiParametersTab.click();

    const saveButton = page.getByTestId("specification-form-save");
    await saveButton.click();

    await expect(page.getByText("Name is required.")).toBeVisible();
    await expect(
        page.getByText(
            "At least one ABI parameter is required when not defining the byte range slices.",
        ),
    ).toBeVisible();

    const name = "My ABI Parameters spec";
    const nameInput = page.getByTestId("specification-name-input");
    await nameInput.focus();
    await page.keyboard.type(name);

    const abiParameterInput = page.getByPlaceholder(
        "address to, uint256 amount, bool succ",
    );
    await abiParameterInput.focus();

    const abiParametersSpec = "invalid-abi-parameter";
    await page.keyboard.type(abiParametersSpec);

    const addButton = page.getByTestId("abi-parameter-add-button");
    await addButton.click();

    await expect(
        page.getByText(
            `Invalid ABI parameter. Details: ${abiParametersSpec} Version: abitype@1.0.7`,
        ),
    ).toBeVisible();

    await saveButton.click();
    await expect(
        page.getByText(`Specification ${name} Saved!`),
    ).not.toBeVisible({
        timeout: 300,
    });
});

test("should be able to edit JSON ABI spec", async ({ page }) => {
    const name = "My E2E JSON ABI spec";
    const nameInput = page.getByTestId("specification-name-input");
    await nameInput.focus();
    await page.keyboard.type(name);

    const jsonAbiTextarea = page.getByTestId("human-readable-abi-input");
    await jsonAbiTextarea.focus();

    const jsonAbiSpec =
        "struct User { string name; uint amount; address}\n" +
        "function createAccount(User user, string role)\n" +
        "function deposit(User user, address from, string reason)";
    await page.keyboard.type(jsonAbiSpec);

    const saveButton = page.getByTestId("specification-form-save");
    await saveButton.click();

    await expect(page.getByText(`Specification ${name} Saved!`)).toBeVisible();
    await page.goto("/specifications");
    await expect(page.getByText(name)).toBeVisible();

    const gridCell = page.getByRole("gridcell");
    const testId = await gridCell.getAttribute("data-testid");
    const specId = testId
        ?.replace("specification", "")
        .replace("card", "")
        .slice(1)
        .slice(0, -1);

    const editButton = page.getByTestId(`edit-specification-${specId}`);
    await editButton.click();
    await page.waitForURL(`/specifications/edit/${specId}`);

    const savedNameInput = await page
        .getByTestId("specification-name-input")
        .inputValue();

    expect(savedNameInput).toBe(name);
});

test("should be able to delete JSON ABI spec", async ({ page }) => {
    const name = "My E2E JSON ABI spec";
    const nameInput = page.getByTestId("specification-name-input");
    await nameInput.focus();
    await page.keyboard.type(name);

    const jsonAbiTextarea = page.getByTestId("human-readable-abi-input");
    await jsonAbiTextarea.focus();

    const jsonAbiSpec =
        "struct User { string name; uint amount; address}\n" +
        "function createAccount(User user, string role)\n" +
        "function deposit(User user, address from, string reason)";
    await page.keyboard.type(jsonAbiSpec);

    const saveButton = page.getByTestId("specification-form-save");
    await saveButton.click();

    await expect(page.getByText(`Specification ${name} Saved!`)).toBeVisible();
    await page.goto("/specifications");
    await expect(page.getByText(name)).toBeVisible();

    let gridCell = page.getByRole("gridcell");
    const testId = await gridCell.getAttribute("data-testid");
    const specId = testId
        ?.replace("specification", "")
        .replace("card", "")
        .slice(1)
        .slice(0, -1);

    const deleteButton = page.getByTestId(`remove-specification-${specId}`);
    await deleteButton.click();

    await expect(gridCell).not.toBeVisible();
});
