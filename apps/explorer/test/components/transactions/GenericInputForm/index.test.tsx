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
            const [firstAmount, secondAmount] = screen.getAllByPlaceholderText(
                "Enter uint256 value",
            );
            typeInto(firstAmount, "10");
            typeInto(secondAmount, "20");

            fireEvent.click(screen.getByText("Add tuple item"));
            typeInto(
                screen.getByPlaceholderText("Enter address value"),
                addressA,
            );
            typeInto(
                screen.getAllByPlaceholderText("Enter uint256 value")[2],
                "5",
            );

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

        it("should remove items from dynamic arrays", async () => {
            renderForm();
            selectFunction("transfer");

            fireEvent.click(screen.getByText("Add uint256 item"));
            fireEvent.click(screen.getByText("Add uint256 item"));
            const [firstAmount, secondAmount] = screen.getAllByPlaceholderText(
                "Enter uint256 value",
            );
            typeInto(firstAmount, "10");
            typeInto(secondAmount, "20");

            fireEvent.click(screen.getByLabelText("Remove uint256[] item 0"));

            expect(
                screen.getByPlaceholderText("Enter uint256 value"),
            ).toHaveValue("20");

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

        it("should show item errors under the array param", async () => {
            renderForm();
            selectFunction("pair");

            const [firstInput] = screen.getAllByPlaceholderText(
                "Enter address value",
            );
            typeInto(firstInput, "0x1");
            fireEvent.blur(firstInput);

            expect(
                await screen.findByText("Invalid address value at [0]"),
            ).toBeInTheDocument();
            expect(screen.getByLabelText("Hex value")).toHaveValue("0x");
        });
    });
});
