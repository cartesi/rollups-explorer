import {
    inputBoxAbi,
    inputBoxAddress,
    v2InputBoxAbi,
    v2InputBoxAddress,
} from "@cartesi/rollups-wagmi";
import {
    fireEvent,
    getByText,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import {
    AbiFunction,
    WaitForTransactionReceiptErrorType,
    stringToHex,
} from "viem";
import { afterEach, beforeEach, describe, it } from "vitest";
import {
    useSimulateContract,
    useWaitForTransactionReceipt,
    useWriteContract,
} from "wagmi";
import {
    GenericInputForm,
    GenericInputFormProps,
} from "../../src/GenericInputForm";
import withMantineTheme from "../utils/WithMantineTheme";
import { factoryWaitStatus } from "../utils/helpers";
import { applications } from "../utils/stubs";
import { abiParam, formSpecification, functionSignature } from "./mocks";

const specifications = [formSpecification];

const defaultProps = {
    applications,
    specifications,
    isLoadingApplications: false,
    onSearchApplications: () => undefined,
    onSuccess: () => undefined,
};

const ComponentE = withMantineTheme(GenericInputForm);
const Component = (overwrites: Partial<GenericInputFormProps> = {}) => (
    <ComponentE
        {...defaultProps}
        applications={[applications[0]]}
        {...overwrites}
    />
);

vi.mock("../../src/GenericInputForm/initialValues");

vi.mock("wagmi");
const useWaitForTransactionReceiptMock = vi.mocked(
    useWaitForTransactionReceipt,
    { partial: true },
);

const useSimulateContractMock = vi.mocked(useSimulateContract, {
    partial: true,
});

const useWriteContractMock = vi.mocked(useWriteContract, {
    partial: true,
});

vi.mock("viem", async () => {
    const actual = await vi.importActual("viem");
    return {
        ...(actual as any),
        getAddress: (address: string) => address,
        encodeFunctionData: vi.fn(),
    };
});

describe("GenericInputForm", () => {
    beforeEach(() => {
        useSimulateContractMock.mockReturnValue({
            data: undefined,
            status: "success",
            isLoading: false,
            isFetching: false,
            isSuccess: true,
            error: null,
        });

        useWriteContractMock.mockReturnValue({
            data: undefined,
            status: "idle",
            writeContract: vi.fn(),
            reset: vi.fn(),
        });

        useWaitForTransactionReceiptMock.mockReturnValue({
            status: "pending",
            fetchStatus: "idle",
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("should display initial fields without application selected", () => {
        render(<Component {...defaultProps} />);

        expect(screen.getByText("Application")).toBeInTheDocument();
        expect(
            screen.getByText("The application smart contract address"),
        ).toBeInTheDocument();

        expect(screen.queryByText("Hex input")).not.toBeInTheDocument();
    });

    it("should display the rest of the form after choosing an application", async () => {
        const { rerender } = render(<Component {...defaultProps} />);

        fireEvent.change(screen.getByTestId("application-autocomplete"), {
            target: { value: applications[0].address },
        });

        rerender(<Component />);

        await waitFor(() =>
            expect(screen.getByText("Hex input")).toBeVisible(),
        );

        expect(screen.getByText("Hex")).toBeVisible();
        expect(screen.getByText("String to Hex")).toBeVisible();
        expect(screen.getByText("ABI to Hex")).toBeVisible();
        expect(screen.getByText("Send")).toBeVisible();
    });

    describe("Hex textarea", () => {
        it("should display correct label for raw input", () => {
            render(<Component />);

            expect(screen.getByText("Hex input")).toBeInTheDocument();
        });

        it("should display correct description for raw input", () => {
            render(<Component />);

            expect(
                screen.getByText("Hex input for the application"),
            ).toBeInTheDocument();
        });

        it("should display error when value is not hex", async () => {
            render(<Component />);
            const textarea = screen.getByTestId(
                "hex-textarea",
            ) as HTMLTextAreaElement;

            fireEvent.change(textarea, {
                target: {
                    value: "",
                },
            });

            fireEvent.blur(textarea);

            expect(textarea.getAttribute("aria-invalid")).toBe("true");
            expect(screen.getByText("Invalid hex value")).toBeInTheDocument();
        });

        it("should not display error when value is hex", () => {
            const { container } = render(<Component />);
            const textarea = container.querySelector(
                "textarea",
            ) as HTMLTextAreaElement;

            fireEvent.change(textarea, {
                target: {
                    value: "0x123123",
                },
            });

            fireEvent.blur(textarea);

            expect(textarea.getAttribute("aria-invalid")).toBe("false");
            expect(() => screen.getByText("Invalid hex string")).toThrow(
                "Unable to find an element",
            );
        });

        it("should correctly format hex data", async () => {
            render(<Component />);

            const execLayerDataInput = screen.getByTestId("hex-textarea");

            const hexValue = "0x123123";
            fireEvent.change(execLayerDataInput, {
                target: {
                    value: hexValue,
                },
            });

            const simulateParams =
                useSimulateContractMock.mock.lastCall?.[0] ?? {};

            expect(simulateParams).toHaveProperty("args", [
                "0x0000000000000000000000000000000000000000",
                hexValue,
            ]);

            expect(simulateParams).toHaveProperty("query", { enabled: false });
        });

        it("should display format tabs", () => {
            render(<Component />);

            expect(screen.getByText("Hex")).toBeInTheDocument();
            expect(screen.getByText("String to Hex")).toBeInTheDocument();
            expect(screen.getByText("ABI to Hex")).toBeInTheDocument();
        });

        it('should display string and hex textareas when "String to Hex" format is selected', () => {
            render(<Component />);

            const button = screen.getByText("String to Hex");
            fireEvent.click(button);

            expect(screen.getByText("String input")).toBeInTheDocument();
            expect(
                screen.getByText("String input for the application"),
            ).toBeInTheDocument();
            expect(screen.getByText("Hex value")).toBeInTheDocument();
            expect(
                screen.getByText("Encoded hex value for the application"),
            ).toBeInTheDocument();
        });

        it("should correctly encode string to hex", () => {
            const { container } = render(<Component />);
            const button = screen.getByText("String to Hex");
            fireEvent.click(button);

            const stringValue = '{"name": "James", "action":"create-game"}';
            const textareas = container.querySelectorAll("textarea");
            const stringTextarea = textareas[0];
            const hexTextarea = textareas[1];

            fireEvent.change(stringTextarea, {
                target: {
                    value: stringValue,
                },
            });

            expect(hexTextarea.value).toBe(stringToHex(stringValue));
        });
    });

    describe("Send button", () => {
        beforeEach(() => {
            useSimulateContractMock.mockReturnValue({
                status: "success",
                isLoading: false,
                isFetching: false,
                isSuccess: true,
                error: null,
                data: {
                    request: {},
                },
            });
        });

        it("should be disabled when raw input is not hex", () => {
            render(<Component />);
            const textarea = screen.getByTestId("hex-textarea");
            const button = screen.getByText("Send").closest("button");
            fireEvent.change(textarea, {
                target: {
                    value: "",
                },
            });

            expect(button).toBeDisabled();
        });

        it("should invoke write function when send button is clicked", async () => {
            const selectedApplication = applications[0].address;
            const mockedWrite = vi.fn();

            useSimulateContractMock.mockReturnValue({
                status: "success",
                isSuccess: true,
                data: {
                    request: {},
                },
                error: null,
            });

            useWriteContractMock.mockReturnValue({
                writeContract: mockedWrite,
            });

            render(<Component />);

            const buttonLabel = screen.getByText("Send");
            const input = screen.getByTestId("application-autocomplete");
            const textarea = screen.getByTestId("hex-textarea");

            fireEvent.change(input, { target: { value: selectedApplication } });
            fireEvent.change(textarea, {
                target: {
                    value: "0x3020",
                },
            });

            fireEvent.blur(input);
            fireEvent.blur(textarea);

            fireEvent.click(buttonLabel);

            expect(buttonLabel.closest("button")).not.toBeDisabled(),
                expect(mockedWrite).toHaveBeenCalled();
        });

        it("should invoke onSearchApplications function after successful submission", async () => {
            const inputWaitStatus = factoryWaitStatus();

            useWriteContractMock.mockReturnValue({
                status: "success",
                data: "0x0001",
                reset: () => {
                    inputWaitStatus.reset();
                },
            });

            useWaitForTransactionReceiptMock.mockReturnValue({
                error: null,
                status: "success",
                isSuccess: true,
            });

            const onSearchApplicationsMock = vi.fn();

            render(
                <Component onSearchApplications={onSearchApplicationsMock} />,
            );

            expect(onSearchApplicationsMock).toHaveBeenCalledWith("");
        });
    });

    describe("warnings", () => {
        it("should display alert for unemployed application", async () => {
            render(<Component applications={[]} />);
            const input = screen.getByTestId("application-autocomplete");

            fireEvent.change(input, {
                target: {
                    value: "0x60a7048c3136293071605a4eaffef49923e981fe",
                },
            });

            await waitFor(() =>
                expect(
                    screen.getByText("This is an undeployed application."),
                ).toBeVisible(),
            );
        });
    });

    describe("When the application is undeployed", () => {
        it("should display rollup-version options to be chosen", async () => {
            render(<Component applications={[]} />);

            fireEvent.change(screen.getByTestId("application-autocomplete"), {
                target: { value: applications[0].address },
            });

            await waitFor(() =>
                expect(
                    screen.getByText("This is an undeployed application."),
                ).toBeVisible(),
            );

            expect(screen.getByText("Cartesi Rollups version")).toBeVisible();
            expect(
                screen.getByText(
                    "Set the rollup version to call the correct contracts.",
                ),
            ).toBeVisible();

            expect(screen.queryByText("Hex input")).not.toBeInTheDocument();
            expect(screen.queryByText("Hex")).not.toBeInTheDocument();
            expect(screen.queryByText("String to Hex")).not.toBeInTheDocument();
            expect(screen.queryByText("ABI to Hex")).not.toBeInTheDocument();
            expect(screen.queryByText("Send")).not.toBeInTheDocument();
        });

        it("should display the rest of the fields after choosing the Rollup version", async () => {
            render(<Component applications={[]} />);

            fireEvent.change(screen.getByTestId("application-autocomplete"), {
                target: { value: applications[0].address },
            });

            await waitFor(() =>
                expect(
                    screen.getByText("This is an undeployed application."),
                ).toBeVisible(),
            );

            const options = screen.getByRole("radiogroup");

            fireEvent.click(getByText(options, "Rollup v1"));

            await waitFor(() =>
                expect(screen.getByText("Hex input")).toBeVisible(),
            );

            expect(screen.getByText("Hex")).toBeVisible();
            expect(screen.getByText("String to Hex")).toBeVisible();
            expect(screen.getByText("ABI to Hex")).toBeVisible();
            expect(screen.getByText("Send")).toBeVisible();
        });

        it("should setup correct contract configs when rollup version is chosen", async () => {
            render(<Component applications={[]} />);

            fireEvent.change(screen.getByTestId("application-autocomplete"), {
                target: { value: applications[0].address },
            });

            await waitFor(() =>
                expect(
                    screen.getByText("This is an undeployed application."),
                ).toBeVisible(),
            );

            const options = screen.getByRole("radiogroup");

            fireEvent.click(getByText(options, "Rollup v1"));

            const paramsForV1 =
                useSimulateContractMock.mock.lastCall?.[0] ?? {};

            expect(paramsForV1).toHaveProperty("abi", inputBoxAbi);
            expect(paramsForV1).toHaveProperty("address", inputBoxAddress);

            fireEvent.click(getByText(options, "Rollup v2"));

            const paramsForV2 =
                useSimulateContractMock.mock.lastCall?.[0] ?? {};

            expect(paramsForV2).toHaveProperty("abi", v2InputBoxAbi);
            expect(paramsForV2).toHaveProperty("address", v2InputBoxAddress);
        });
    });

    describe("ApplicationAutocomplete", () => {
        it("should display error when application is invalid", () => {
            render(<Component {...defaultProps} />);
            const input = screen.getByTestId("application-autocomplete");

            fireEvent.change(input, {
                target: {
                    value: "0x60a7048c3136293071605a4eaffef49923e981ccffffffff",
                },
            });

            fireEvent.blur(input);

            expect(input.getAttribute("aria-invalid")).toBe("true");
            expect(screen.getByText("Invalid application")).toBeInTheDocument();
        });

        it("should correctly format address", async () => {
            render(<Component />);
            const input = screen.getByTestId("application-autocomplete");

            const application = applications[0];

            fireEvent.change(input, {
                target: {
                    value: application.address,
                },
            });

            const simulateParams =
                useSimulateContractMock.mock.lastCall?.[0] ?? {};

            expect(simulateParams).toHaveProperty("args", [
                application.address,
                "0x",
            ]);
            expect(simulateParams).toHaveProperty("query", { enabled: true });
        });
    });

    describe("Alerts", () => {
        it("should display alert for successful transaction", async () => {
            useWaitForTransactionReceiptMock.mockReturnValue({
                status: "success",
                isSuccess: true,
                error: null,
                data: { transactionHash: "0x002" },
            });

            const onSuccess = vi.fn();

            render(<Component onSuccess={onSuccess} />);

            expect(onSuccess).toHaveBeenCalledWith({
                type: "RAW",
                receipt: { transactionHash: "0x002" },
            });
        });

        it("should display alert for failed transaction", async () => {
            const message = "User declined the transaction";

            useWriteContractMock.mockReturnValue({
                isError: true,
                isPending: false,
                isSuccess: false,
            });

            useWaitForTransactionReceiptMock.mockReturnValue({
                status: "error",
                isError: true,
                isLoading: false,
                error: {
                    shortMessage: message,
                } as WaitForTransactionReceiptErrorType,
                isSuccess: false,
            });

            render(<Component />);

            await waitFor(() =>
                expect(screen.getByText(message)).toBeVisible(),
            );
        });
    });

    describe("ABI encoding", () => {
        beforeEach(() => {
            useSimulateContractMock.mockReturnValue({
                status: "success",
                isLoading: false,
                isSuccess: true,
                error: null,
                data: {
                    request: {},
                },
            });
        });

        it("should send ABI encoded data from existing JSON_ABI specification", async () => {
            const selectedApplication = applications[0].address;
            const mockedWrite = vi.fn();

            useWriteContractMock.mockReturnValue({
                writeContract: mockedWrite,
                status: "idle",
                isIdle: true,
            });

            render(<Component />);
            const button = screen.getByText("ABI to Hex");
            fireEvent.click(button);

            const applicationAutocomplete = screen.getByTestId(
                "application-autocomplete",
            );

            fireEvent.change(applicationAutocomplete, {
                target: {
                    value: selectedApplication,
                },
            });

            expect(
                screen.getByText("ABI from an existing JSON_ABI specification"),
            ).toBeInTheDocument();

            const specificationsInput = screen.getByPlaceholderText(
                "Select specification",
            );
            fireEvent.click(specificationsInput);

            const specificationOption = screen.getByText(
                formSpecification.name,
            );
            expect(specificationOption).toBeInTheDocument();
            fireEvent.click(specificationOption);

            const selectFunctionInput = screen.getByText("Select function");
            expect(selectFunctionInput).toBeInTheDocument();
            fireEvent.click(selectFunctionInput);

            const abiFunction = formSpecification.abi[0] as AbiFunction;
            const functionNameOption = screen.getByText(abiFunction.name);

            expect(functionNameOption).toBeInTheDocument();
            fireEvent.click(functionNameOption);

            const intInput = screen.getByPlaceholderText("Enter uint256 value");
            expect(intInput).toBeInTheDocument();

            const intValue = "150";
            fireEvent.change(intInput, {
                target: {
                    value: intValue,
                },
            });

            const boolInput = screen.getByPlaceholderText("Enter bool value");
            expect(boolInput).toBeInTheDocument();

            const boolValue = "false";
            fireEvent.change(boolInput, {
                target: {
                    value: boolValue,
                },
            });

            const submitButton = screen.getByTestId(
                "generic-input-submit-button",
            );

            expect(submitButton).not.toBeDisabled();

            fireEvent.click(submitButton);
            expect(mockedWrite).toHaveBeenCalled();
        });

        it("should validate form when attempting to submit invalid ABI encoded data from existing JSON_ABI specification", async () => {
            const selectedApplication = applications[0].address;
            const mockedWrite = vi.fn();

            useWriteContractMock.mockReturnValue({
                writeContract: mockedWrite,
                status: "idle",
                isIdle: true,
            });

            render(<Component />);
            const button = screen.getByText("ABI to Hex");
            fireEvent.click(button);

            const applicationAutocomplete = screen.getByTestId(
                "application-autocomplete",
            );

            fireEvent.change(applicationAutocomplete, {
                target: {
                    value: selectedApplication,
                },
            });

            expect(
                screen.getByText("ABI from an existing JSON_ABI specification"),
            ).toBeInTheDocument();

            const specificationsInput = screen.getByPlaceholderText(
                "Select specification",
            );
            fireEvent.click(specificationsInput);
            fireEvent.blur(specificationsInput);
            expect(
                screen.getByText("Invalid specification"),
            ).toBeInTheDocument();

            fireEvent.click(specificationsInput);
            const specificationOption = screen.getByText(
                formSpecification.name,
            );
            expect(specificationOption).toBeInTheDocument();
            fireEvent.click(specificationOption);

            const selectFunctionInput = screen.getByText("Select function");
            expect(selectFunctionInput).toBeInTheDocument();
            fireEvent.click(selectFunctionInput);
            fireEvent.blur(selectFunctionInput);
            expect(
                screen.getByText("Invalid ABI function"),
            ).toBeInTheDocument();
            fireEvent.click(selectFunctionInput);

            const abiFunction = formSpecification.abi[0] as AbiFunction;
            const functionNameOption = screen.getByText(abiFunction.name);
            expect(functionNameOption).toBeInTheDocument();
            fireEvent.click(functionNameOption);

            const intInput = screen.getByPlaceholderText("Enter uint256 value");
            expect(intInput).toBeInTheDocument();

            fireEvent.change(intInput, {
                target: {
                    value: "invalid-value",
                },
            });

            fireEvent.blur(intInput);
            expect(
                screen.getByText("Invalid uint256 value"),
            ).toBeInTheDocument();

            const intValue = "150";
            fireEvent.change(intInput, {
                target: {
                    value: intValue,
                },
            });

            const boolInput = screen.getByPlaceholderText("Enter bool value");
            expect(boolInput).toBeInTheDocument();
            fireEvent.change(boolInput, {
                target: {
                    value: "invalid-value",
                },
            });
            fireEvent.blur(boolInput);
            expect(screen.getByText("Invalid bool value")).toBeInTheDocument();

            const boolValue = "false";
            fireEvent.change(boolInput, {
                target: {
                    value: boolValue,
                },
            });

            const submitButton = screen.getByTestId(
                "generic-input-submit-button",
            );

            expect(submitButton.hasAttribute("disabled")).toBe(false);
            fireEvent.click(submitButton);
            expect(mockedWrite).toHaveBeenCalled();
        });

        it("should send ABI encoded data from new JSON_ABI specification", async () => {
            const selectedApplication = applications[0].address;
            const mockedWrite = vi.fn();

            useWriteContractMock.mockReturnValue({
                writeContract: mockedWrite,
                status: "idle",
                isIdle: true,
            });

            render(<Component />);
            const button = screen.getByText("ABI to Hex");
            fireEvent.click(button);

            const abiSelect = screen.getByTestId("abi-method-select");
            fireEvent.click(abiSelect);

            const newAbiOption = screen.getByText("New ABI");
            expect(newAbiOption).toBeInTheDocument();
            fireEvent.click(newAbiOption);

            const applicationAutocomplete = screen.getByTestId(
                "application-autocomplete",
            );

            fireEvent.change(applicationAutocomplete, {
                target: {
                    value: selectedApplication,
                },
            });

            const humanAbiTextarea = screen.getByTestId("json-abi-textarea");
            fireEvent.change(humanAbiTextarea, {
                target: {
                    value: functionSignature,
                },
            });

            const selectFunctionInput = screen.getByText("Select function");
            expect(selectFunctionInput).toBeInTheDocument();
            fireEvent.click(selectFunctionInput);

            const abiFunction = formSpecification.abi[0] as AbiFunction;
            const functionNameOption = screen.getByText(abiFunction.name);

            expect(functionNameOption).toBeInTheDocument();
            fireEvent.click(functionNameOption);

            const intInput = screen.getByPlaceholderText("Enter uint256 value");
            expect(intInput).toBeInTheDocument();

            const intValue = "150";
            fireEvent.change(intInput, {
                target: {
                    value: intValue,
                },
            });

            const boolInput = screen.getByPlaceholderText("Enter bool value");
            expect(boolInput).toBeInTheDocument();

            const boolValue = "false";
            fireEvent.change(boolInput, {
                target: {
                    value: boolValue,
                },
            });

            const submitButton = screen.getByTestId(
                "generic-input-submit-button",
            );

            expect(submitButton.hasAttribute("disabled")).toBe(false);
            fireEvent.click(submitButton);
            expect(mockedWrite).toHaveBeenCalled();
        });

        it("should validate form when attempting to submit invalid ABI encoded data from new JSON_ABI specification", async () => {
            const selectedApplication = applications[0].address;
            const mockedWrite = vi.fn();

            useWriteContractMock.mockReturnValue({
                writeContract: mockedWrite,
                status: "idle",
                isIdle: true,
            });

            render(<Component />);
            const button = screen.getByText("ABI to Hex");
            fireEvent.click(button);

            const abiSelect = screen.getByTestId("abi-method-select");
            fireEvent.click(abiSelect);

            const newAbiOption = screen.getByText("New ABI");
            expect(newAbiOption).toBeInTheDocument();
            fireEvent.click(newAbiOption);

            const applicationAutocomplete = screen.getByTestId(
                "application-autocomplete",
            );

            fireEvent.change(applicationAutocomplete, {
                target: {
                    value: selectedApplication,
                },
            });

            const humanAbiTextarea = screen.getByTestId("json-abi-textarea");
            fireEvent.change(humanAbiTextarea, {
                target: {
                    value: "invalid-value",
                },
            });
            expect(
                screen.getByText(
                    "Unknown signature. Details: invalid-value Version: abitype@1.0.7",
                ),
            ).toBeInTheDocument();

            fireEvent.change(humanAbiTextarea, {
                target: {
                    value: functionSignature,
                },
            });

            const selectFunctionInput = screen.getByText("Select function");
            expect(selectFunctionInput).toBeInTheDocument();
            fireEvent.click(selectFunctionInput);
            fireEvent.blur(selectFunctionInput);
            expect(
                screen.getByText("Invalid ABI function"),
            ).toBeInTheDocument();
            fireEvent.click(selectFunctionInput);

            const abiFunction = formSpecification.abi[0] as AbiFunction;
            const functionNameOption = screen.getByText(abiFunction.name);
            expect(functionNameOption).toBeInTheDocument();
            fireEvent.click(functionNameOption);

            const intInput = screen.getByPlaceholderText("Enter uint256 value");
            expect(intInput).toBeInTheDocument();

            fireEvent.change(intInput, {
                target: {
                    value: "invalid-value",
                },
            });
            fireEvent.blur(intInput);
            expect(
                screen.getByText("Invalid uint256 value"),
            ).toBeInTheDocument();

            const intValue = "150";
            fireEvent.change(intInput, {
                target: {
                    value: intValue,
                },
            });

            const boolInput = screen.getByPlaceholderText("Enter bool value");
            expect(boolInput).toBeInTheDocument();
            fireEvent.change(boolInput, {
                target: {
                    value: "invalid-value",
                },
            });
            fireEvent.blur(boolInput);
            expect(screen.getByText("Invalid bool value")).toBeInTheDocument();

            const boolValue = "false";
            fireEvent.change(boolInput, {
                target: {
                    value: boolValue,
                },
            });

            const submitButton = screen.getByTestId(
                "generic-input-submit-button",
            );

            expect(submitButton.hasAttribute("disabled")).toBe(false);
            fireEvent.click(submitButton);
            expect(mockedWrite).toHaveBeenCalled();
        });

        it("should send ABI encoded data from new ABI params specification", async () => {
            const selectedApplication = applications[0].address;
            const mockedWrite = vi.fn();

            useWriteContractMock.mockReturnValue({
                writeContract: mockedWrite,
                status: "idle",
                isIdle: true,
            });

            render(<Component />);
            const button = screen.getByText("ABI to Hex");
            fireEvent.click(button);

            const abiSelect = screen.getByTestId("abi-method-select");
            fireEvent.click(abiSelect);

            const newAbiOption = screen.getByText("New ABI");
            expect(newAbiOption).toBeInTheDocument();
            fireEvent.click(newAbiOption);

            const abiParametersButton = screen.getByText("ABI Parameters");
            expect(abiParametersButton).toBeInTheDocument();
            fireEvent.click(abiParametersButton);

            const applicationAutocomplete = screen.getByTestId(
                "application-autocomplete",
            );

            fireEvent.change(applicationAutocomplete, {
                target: {
                    value: selectedApplication,
                },
            });

            const abiParameterInput = screen.getByTestId("abi-parameter-input");
            fireEvent.change(abiParameterInput, {
                target: {
                    value: abiParam,
                },
            });

            const addButton = screen.getByTestId("abi-parameter-add-button");
            fireEvent.click(addButton);

            const intInput = screen.getByPlaceholderText("Enter uint256 value");
            expect(intInput).toBeInTheDocument();

            const intValue = "150";
            fireEvent.change(intInput, {
                target: {
                    value: intValue,
                },
            });

            const boolInput = screen.getByPlaceholderText("Enter bool value");
            expect(boolInput).toBeInTheDocument();

            const boolValue = "false";
            fireEvent.change(boolInput, {
                target: {
                    value: boolValue,
                },
            });

            const submitButton = screen.getByTestId(
                "generic-input-submit-button",
            );

            expect(submitButton.hasAttribute("disabled")).toBe(false);
            fireEvent.click(submitButton);
            expect(mockedWrite).toHaveBeenCalled();
        });

        it("should validate form when attempting to submit invalid ABI encoded data from new ABI params specification", async () => {
            const selectedApplication = applications[0].address;
            const mockedWrite = vi.fn();
            useWriteContractMock.mockReturnValue({
                writeContract: mockedWrite,
                status: "idle",
                isIdle: true,
            });

            render(<Component />);
            const button = screen.getByText("ABI to Hex");
            fireEvent.click(button);

            const abiSelect = screen.getByTestId("abi-method-select");
            fireEvent.click(abiSelect);

            const newAbiOption = screen.getByText("New ABI");
            expect(newAbiOption).toBeInTheDocument();
            fireEvent.click(newAbiOption);

            const abiParametersButton = screen.getByText("ABI Parameters");
            expect(abiParametersButton).toBeInTheDocument();
            fireEvent.click(abiParametersButton);

            const applicationAutocomplete = screen.getByTestId(
                "application-autocomplete",
            );

            fireEvent.change(applicationAutocomplete, {
                target: {
                    value: selectedApplication,
                },
            });

            const abiParameterInput = screen.getByTestId("abi-parameter-input");
            fireEvent.change(abiParameterInput, {
                target: {
                    value: "invalid-value",
                },
            });
            expect(
                screen.getByText(
                    "Invalid ABI parameter. Details: invalid-value Version: abitype@1.0.7",
                ),
            ).toBeInTheDocument();
            fireEvent.change(abiParameterInput, {
                target: {
                    value: abiParam,
                },
            });

            const addButton = screen.getByTestId("abi-parameter-add-button");
            fireEvent.click(addButton);

            const intInput = screen.getByPlaceholderText("Enter uint256 value");
            expect(intInput).toBeInTheDocument();

            fireEvent.change(intInput, {
                target: {
                    value: "invalid-value",
                },
            });
            fireEvent.blur(intInput);
            expect(
                screen.getByText("Invalid uint256 value"),
            ).toBeInTheDocument();

            const intValue = "150";
            fireEvent.change(intInput, {
                target: {
                    value: intValue,
                },
            });

            const boolInput = screen.getByPlaceholderText("Enter bool value");
            expect(boolInput).toBeInTheDocument();
            fireEvent.change(boolInput, {
                target: {
                    value: "invalid-value",
                },
            });
            fireEvent.blur(boolInput);
            expect(screen.getByText("Invalid bool value")).toBeInTheDocument();

            const boolValue = "false";
            fireEvent.change(boolInput, {
                target: {
                    value: boolValue,
                },
            });

            const submitButton = screen.getByTestId(
                "generic-input-submit-button",
            );

            expect(submitButton.hasAttribute("disabled")).toBe(false);
            fireEvent.click(submitButton);
            expect(mockedWrite).toHaveBeenCalled();
        });
    });

    describe("Form", () => {
        it("should cleanup and go to initial state after transaction is confirmed", async () => {
            const inputAddedReset = vi.fn();
            // Avoiding infinite loop by making a computed prop change when deposit reset is called.
            const inputAddedWaitStatus = factoryWaitStatus();

            useSimulateContractMock.mockReturnValue({
                status: "success",
                isLoading: false,
                isFetching: false,
                isSuccess: true,
                error: null,
                data: {
                    request: {},
                },
            });

            useWriteContractMock.mockReturnValue({
                status: "success",
                data: "0x0001",
                reset: () => {
                    inputAddedReset();
                    inputAddedWaitStatus.reset();
                },
            });

            useWaitForTransactionReceiptMock.mockImplementation((params) => {
                return params?.hash === "0x0001"
                    ? {
                          ...inputAddedWaitStatus.props,
                          fetchStatus: "idle",
                          data: { transactionHash: "0x02" },
                      }
                    : {
                          fetchStatus: "idle",
                      };
            });

            const onSuccess = vi.fn();
            const onSearchApplication = vi.fn();

            const { rerender } = render(
                <Component
                    onSuccess={onSuccess}
                    onSearchApplications={onSearchApplication}
                />,
            );

            fireEvent.change(screen.getByTestId("application-autocomplete"), {
                target: { value: applications[0].address },
            });

            fireEvent.change(screen.getByTestId("hex-textarea"), {
                target: { value: "0x3020" },
            });

            expect(onSuccess).toHaveBeenCalledWith({
                receipt: { transactionHash: "0x02" },
                type: "RAW",
            });
            expect(onSearchApplication).toHaveBeenCalledWith("");

            expect(inputAddedReset).toHaveBeenCalledTimes(1);

            rerender(
                <Component
                    applications={applications}
                    onSuccess={onSuccess}
                    onSearchApplications={onSearchApplication}
                />,
            );

            await waitFor(() =>
                expect(screen.queryByText("Hex input")).not.toBeInTheDocument(),
            );

            expect(screen.queryByText("Hex")).not.toBeInTheDocument();
            expect(screen.queryByText("String to Hex")).not.toBeInTheDocument();
            expect(screen.queryByText("ABI to Hex")).not.toBeInTheDocument();
            expect(screen.queryByText("Send")).not.toBeInTheDocument();
        });
    });
});
