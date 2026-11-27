import { encodeFunctionData, parseAbi } from "viem";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { GenericInputForm } from "../../../../src/components/transactions/GenericInputForm";
import {
    createApplication,
    fireEvent,
    render,
    screen,
    waitFor,
} from "../../../test-utils";

const mocks = vi.hoisted(() => ({
    useSimulateInputBoxAddInput: vi.fn(),
    useWriteInputBoxAddInput: vi.fn(),
    useWaitForTransactionReceipt: vi.fn(),
}));

vi.mock("@cartesi/react", () => ({
    inputBoxAddress: "0xc70074BDD26d8cF983Ca6A5b89b8db52D5850051",
    useSimulateInputBoxAddInput: mocks.useSimulateInputBoxAddInput,
    useWriteInputBoxAddInput: mocks.useWriteInputBoxAddInput,
}));

vi.mock("wagmi", () => ({
    useWaitForTransactionReceipt: mocks.useWaitForTransactionReceipt,
}));

const addressA = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const addressB = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

const abi = parseAbi([
    "function transfer(uint256[] amounts, (address to, uint256 value)[] items)",
    "function pair(address[2] owners)",
    "function setLevels(uint8[] levels)",
    "function pause()",
    "function resume()",
    "function order((string id, uint256[] amounts) o)",
]);

const specification = { id: "1", name: "Array specification", abi };

const renderForm = () =>
    render(
        <GenericInputForm
            application={createApplication()}
            specifications={[specification]}
            onSuccess={vi.fn()}
        />,
    );

const selectFunction = (name: string) => {
    fireEvent.click(screen.getByText("ABI to Hex"));
    fireEvent.click(screen.getByPlaceholderText("Select specification"));
    fireEvent.click(screen.getByText(specification.name));
    fireEvent.click(screen.getByText("Select function"));
    fireEvent.click(screen.getByText(name));
};

const typeInto = (element: HTMLElement, value: string) =>
    fireEvent.change(element, { target: { value } });

describe("GenericInputForm", () => {
    beforeAll(() => {
        Element.prototype.scrollIntoView = vi.fn();
    });

    beforeEach(() => {
        vi.clearAllMocks();
        mocks.useSimulateInputBoxAddInput.mockReturnValue({
            error: null,
            fetchStatus: "idle",
            status: "success",
            data: { request: {} },
        });
        mocks.useWriteInputBoxAddInput.mockReturnValue({
            status: "idle",
            reset: vi.fn(),
            writeContract: vi.fn(),
        });
        mocks.useWaitForTransactionReceipt.mockReturnValue({
            fetchStatus: "idle",
            status: "pending",
        });
    });

    describe("ABI encoding with array params", () => {
        it("should encode dynamic arrays of primitives and tuples", async () => {
            renderForm();
            selectFunction("transfer");

            fireEvent.click(screen.getByText("Add uint256 item"));
            fireEvent.click(screen.getByText("Add uint256 item"));
            typeInto(screen.getByLabelText("amounts[0]"), "10");
            typeInto(screen.getByLabelText("amounts[1]"), "20");

            fireEvent.click(screen.getByText("Add tuple item"));
            typeInto(
                screen.getByLabelText("address to, items[0].to"),
                addressA,
            );
            const value = screen.getByLabelText(
                "uint256 value, items[0].value",
            );
            typeInto(value, "x");
            fireEvent.blur(value);

            expect(
                await screen.findByText("Invalid uint256 value at [0].value"),
            ).toBeInTheDocument();
            expect(value).toHaveAccessibleDescription(
                "Invalid uint256 value at [0].value",
            );

            typeInto(value, "5");

            expect(value).not.toHaveAccessibleDescription();

            const expected = encodeFunctionData({
                abi,
                functionName: "transfer",
                args: [[10n, 20n], [{ to: addressA, value: 5n }]],
            });

            await waitFor(() =>
                expect(screen.getByLabelText("Hex value")).toHaveValue(
                    expected,
                ),
            );
        });

        it("should block sending until the payload matches the remaining items", async () => {
            renderForm();
            selectFunction("transfer");

            fireEvent.click(screen.getByText("Add uint256 item"));
            fireEvent.click(screen.getByText("Add uint256 item"));
            const [firstAmount, secondAmount] = screen.getAllByPlaceholderText(
                "Enter uint256 value",
            );
            typeInto(firstAmount, "10");
            typeInto(secondAmount, "20");

            fireEvent.click(screen.getByLabelText("Remove amounts[0]"));

            const submitButton = screen.getByTestId(
                "generic-input-submit-button",
            );
            expect(
                screen.getByPlaceholderText("Enter uint256 value"),
            ).toHaveValue("20");
            expect(submitButton).toBeDisabled();

            const expected = encodeFunctionData({
                abi,
                functionName: "transfer",
                args: [[20n], []],
            });

            await waitFor(() =>
                expect(screen.getByLabelText("Hex value")).toHaveValue(
                    expected,
                ),
            );
            expect(submitButton).toBeEnabled();
        });

        it("should render a fixed number of items for fixed-size arrays", async () => {
            renderForm();
            selectFunction("pair");

            const inputs = screen.getAllByPlaceholderText(
                "Enter address value",
            );
            expect(inputs).toHaveLength(2);
            expect(
                screen.queryByText("Add address item"),
            ).not.toBeInTheDocument();

            typeInto(inputs[0], addressA);
            typeInto(inputs[1], addressB);

            const expected = encodeFunctionData({
                abi,
                functionName: "pair",
                args: [[addressA, addressB]],
            });

            await waitFor(() =>
                expect(screen.getByLabelText("Hex value")).toHaveValue(
                    expected,
                ),
            );
        });

        it("should re-encode the payload when switching to another function", async () => {
            renderForm();
            selectFunction("pause");

            await waitFor(() =>
                expect(screen.getByLabelText("Hex value")).toHaveValue(
                    encodeFunctionData({ abi, functionName: "pause" }),
                ),
            );

            fireEvent.click(
                screen.getByRole("button", { name: /ABI Function/ }),
            );
            fireEvent.click(screen.getByRole("option", { name: /resume/ }));

            expect(
                screen.getByTestId("generic-input-submit-button"),
            ).toBeDisabled();
            await waitFor(() =>
                expect(screen.getByLabelText("Hex value")).toHaveValue(
                    encodeFunctionData({ abi, functionName: "resume" }),
                ),
            );
        });

        it("should block sending when an item can't be encoded", async () => {
            renderForm();
            selectFunction("setLevels");

            fireEvent.click(screen.getByText("Add uint8 item"));
            const input = screen.getByPlaceholderText("Enter uint8 value");
            typeInto(input, "25");

            await waitFor(() =>
                expect(screen.getByLabelText("Hex value")).toHaveValue(
                    encodeFunctionData({
                        abi,
                        functionName: "setLevels",
                        args: [[25]],
                    }),
                ),
            );

            typeInto(input, "256");
            fireEvent.blur(input);

            expect(
                await screen.findByText("Invalid uint8 value at [0]"),
            ).toBeInTheDocument();
            expect(input).toHaveAttribute("aria-invalid", "true");
            expect(input).toHaveAccessibleDescription(
                "Invalid uint8 value at [0]",
            );
            expect(screen.getByLabelText("Hex value")).toHaveValue("0x");
            expect(
                screen.getByTestId("generic-input-submit-button"),
            ).toBeDisabled();

            fireEvent.click(screen.getByLabelText("Remove levels[0]"));

            expect(
                screen.queryByText("Invalid uint8 value at [0]"),
            ).not.toBeInTheDocument();
        });

        it("should encode arrays inside a tuple param", async () => {
            renderForm();
            selectFunction("order");

            fireEvent.click(screen.getByLabelText("Add item to o.amounts"));
            typeInto(screen.getByLabelText("o.amounts[0]"), "7");

            await waitFor(() =>
                expect(screen.getByLabelText("Hex value")).toHaveValue(
                    encodeFunctionData({
                        abi,
                        functionName: "order",
                        args: [{ id: "", amounts: [7n] }],
                    }),
                ),
            );
            expect(
                screen.getByTestId("generic-input-submit-button"),
            ).toBeEnabled();
        });

        it("should drop a pending payload when switching mode", async () => {
            render(
                <GenericInputForm
                    application={createApplication()}
                    specifications={[]}
                    onSuccess={vi.fn()}
                />,
            );

            fireEvent.click(screen.getByText("ABI to Hex"));
            fireEvent.click(screen.getByText("ABI Parameters"));
            typeInto(screen.getByTestId("abi-parameter-input"), "uint256 a");
            fireEvent.click(screen.getByTestId("abi-parameter-add-button"));
            typeInto(screen.getByPlaceholderText("Enter uint256 value"), "5");
            fireEvent.click(screen.getByText("Hex"));

            await new Promise((resolve) => setTimeout(resolve, 600));

            expect(screen.getByTestId("hex-textarea")).toHaveValue("0x");
        });
    });
});
