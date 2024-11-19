import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterAll, describe, it } from "vitest";
import { GenericInputForm } from "../../src/GenericInputForm";
import withMantineTheme from "../utils/WithMantineTheme";
import { AbiFunction, getAddress, stringToHex } from "viem";
import { abiParam, formSpecification, functionSignature } from "./mocks";

const Component = withMantineTheme(GenericInputForm);

const applications = [
    "0x60a7048c3136293071605a4eaffef49923e981cc",
    "0x70ac08179605af2d9e75782b8decdd3c22aa4d0c",
    "0x71ab24ee3ddb97dc01a161edf64c8d51102b0cd3",
];

const specifications = [formSpecification];

const defaultProps = {
    applications,
    specifications,
    isLoadingApplications: false,
    onSearchApplications: () => undefined,
    onSuccess: () => undefined,
};

vi.mock("../../src/GenericInputForm/initialValues");

vi.mock("@cartesi/rollups-wagmi", async () => {
    return {
        useSimulateInputBoxAddInput: () => ({
            data: {
                request: {},
            },
            config: {},
        }),
        useWriteInputBoxAddInput: () => ({
            wait: vi.fn(),
            reset: vi.fn(),
            execute: vi.fn(),
        }),
    };
});

vi.mock("wagmi", async () => {
    return {
        useWaitForTransactionReceipt: () => ({}),
    };
});

vi.mock("viem", async () => {
    const actual = await vi.importActual("viem");
    return {
        ...(actual as any),
        getAddress: (address: string) => address,
        encodeFunctionData: vi.fn(),
    };
});

vi.mock("@mantine/form", async () => {
    const actual = await vi.importActual("@mantine/form");
    return {
        ...(actual as any),
        useForm: (actual as any).useForm,
    };
});

describe("GenericInputForm", () => {
    // beforeAll(() => {
    afterAll(() => {
        vi.clearAllMocks();
    });

    describe("Hex textarea", () => {
        it("should display correct label for raw input", () => {
            render(<Component {...defaultProps} />);

            expect(screen.getByText("Hex input")).toBeInTheDocument();
        });

        it("should display correct description for raw input", () => {
            render(<Component {...defaultProps} />);

            expect(
                screen.getByText("Hex input for the application"),
            ).toBeInTheDocument();
        });

        it("should display error when value is not hex", async () => {
            render(<Component {...defaultProps} />);
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
            const { container } = render(<Component {...defaultProps} />);
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
            const rollupsWagmi = await import("@cartesi/rollups-wagmi");
            const mockedHook = vi.fn().mockReturnValue({
                ...rollupsWagmi.useSimulateInputBoxAddInput,
                loading: false,
                error: null,
            });
            rollupsWagmi.useSimulateInputBoxAddInput = vi
                .fn()
                .mockImplementation(mockedHook);

            const { container } = render(<Component {...defaultProps} />);
            const execLayerDataInput = container.querySelector(
                "textarea",
            ) as HTMLTextAreaElement;

            const hexValue = "0x123123";
            fireEvent.change(execLayerDataInput, {
                target: {
                    value: hexValue,
                },
            });

            expect(mockedHook).toHaveBeenLastCalledWith({
                args: ["0x0000000000000000000000000000000000000000", hexValue],
                query: {
                    enabled: false,
                },
                value: undefined,
            });
        });

        it("should display format tabs", () => {
            render(<Component {...defaultProps} />);

            expect(screen.getByText("Hex")).toBeInTheDocument();
            expect(screen.getByText("String to Hex")).toBeInTheDocument();
            expect(screen.getByText("ABI to Hex")).toBeInTheDocument();
        });

        it('should display string and hex textareas when "String to Hex" format is selected', () => {
            render(<Component {...defaultProps} />);

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
            const { container } = render(<Component {...defaultProps} />);
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
        it("should be disabled when raw input is not hex", () => {
            const { container } = render(<Component {...defaultProps} />);
            const textarea = container.querySelector(
                "textarea",
            ) as HTMLTextAreaElement;
            const button = container.querySelector(
                "button",
            ) as HTMLButtonElement;

            fireEvent.change(textarea, {
                target: {
                    value: "",
                },
            });

            expect(button.hasAttribute("disabled")).toBe(true);
        });

        it("should invoke write function when send button is clicked", async () => {
            const selectedApplication = applications[1];
            const mockedWrite = vi.fn();
            const rollupsWagmi = await import("@cartesi/rollups-wagmi");
            rollupsWagmi.useSimulateInputBoxAddInput = vi.fn().mockReturnValue({
                ...rollupsWagmi.useSimulateInputBoxAddInput,
                data: {
                    request: {},
                },
                error: null,
            });
            rollupsWagmi.useWriteInputBoxAddInput = vi.fn().mockReturnValue({
                ...rollupsWagmi.useWriteInputBoxAddInput,
                writeContract: mockedWrite,
                execute: vi.fn(),
                reset: vi.fn(),
            });

            const { container } = render(<Component {...defaultProps} />);
            const button = container.querySelector(
                "button",
            ) as HTMLButtonElement;

            const input = container.querySelector("input") as HTMLInputElement;
            input.setAttribute("value", selectedApplication);

            fireEvent.change(input, {
                target: {
                    value: selectedApplication,
                },
            });

            fireEvent.click(button);
            expect(button.hasAttribute("disabled")).toBe(false);
            expect(mockedWrite).toHaveBeenCalled();
        });

        it("should invoke onSearchApplications function after successful submission", async () => {
            const wagmi = await import("wagmi");
            wagmi.useWaitForTransactionReceipt = vi.fn().mockReturnValue({
                ...wagmi.useWaitForTransactionReceipt,
                error: null,
                isSuccess: true,
            });

            const onSearchApplicationsMock = vi.fn();
            render(
                <Component
                    {...defaultProps}
                    onSearchApplications={onSearchApplicationsMock}
                />,
            );

            expect(onSearchApplicationsMock).toHaveBeenCalledWith("");
        });

        it('should enable "useSimulateInputBoxAddInput" only when the form is valid', async () => {
            const rollupsWagmi = await import("@cartesi/rollups-wagmi");
            const mockedHook = vi.fn().mockReturnValue({
                ...rollupsWagmi.useSimulateInputBoxAddInput,
                loading: false,
                error: null,
            });
            rollupsWagmi.useSimulateInputBoxAddInput = vi
                .fn()
                .mockImplementation(mockedHook);

            const { container } = render(<Component {...defaultProps} />);
            const input = container.querySelector("input") as HTMLInputElement;
            const textarea = container.querySelector(
                "textarea",
            ) as HTMLTextAreaElement;

            const [application] = applications;
            fireEvent.change(input, {
                target: {
                    value: application,
                },
            });

            fireEvent.change(textarea, {
                target: {
                    value: "",
                },
            });

            expect(mockedHook).toHaveBeenLastCalledWith({
                args: [getAddress(application), ""],
                query: {
                    enabled: false,
                },
            });

            fireEvent.change(input, {
                target: {
                    value: "",
                },
            });

            fireEvent.change(textarea, {
                target: {
                    value: "0x",
                },
            });

            expect(mockedHook).toHaveBeenLastCalledWith({
                args: ["0x0000000000000000000000000000000000000000", "0x"],
                query: {
                    enabled: false,
                },
            });

            fireEvent.change(input, {
                target: {
                    value: application,
                },
            });

            fireEvent.change(textarea, {
                target: {
                    value: "0x",
                },
            });

            expect(mockedHook).toHaveBeenLastCalledWith({
                args: [getAddress(application), "0x"],
                query: {
                    enabled: true,
                },
            });
        });

        it("should invoke onSuccess callback after successful deposit", async () => {
            const wagmi = await import("wagmi");
            wagmi.useWaitForTransactionReceipt = vi.fn().mockReturnValue({
                ...wagmi.useWaitForTransactionReceipt,
                error: null,
                isSuccess: true,
            });

            const onSuccessMock = vi.fn();
            render(<Component {...defaultProps} onSuccess={onSuccessMock} />);

            expect(onSuccessMock).toHaveBeenCalled();
        });
    });

    describe("ApplicationAutocomplete", () => {
        it("should display correct label for applications input", () => {
            render(<Component {...defaultProps} />);

            expect(screen.getByText("Application")).toBeInTheDocument();
        });

        it("should display correct description for applications input", () => {
            render(<Component {...defaultProps} />);

            expect(
                screen.getByText("The application smart contract address"),
            ).toBeInTheDocument();
        });

        it("should display correct placeholder", () => {
            const { container } = render(<Component {...defaultProps} />);
            const input = container.querySelector("input");

            expect(input?.getAttribute("placeholder")).toBe("0x");
        });

        it("should display alert for unemployed application", async () => {
            const { container } = render(<Component {...defaultProps} />);
            const input = container.querySelector("input") as HTMLInputElement;

            fireEvent.change(input, {
                target: {
                    value: "0x60a7048c3136293071605a4eaffef49923e981fe",
                },
            });

            await waitFor(
                () =>
                    expect(
                        screen.getByText("This is an undeployed application."),
                    ).toBeInTheDocument(),
                {
                    timeout: 1100,
                },
            );
        });

        it("should display error when application is invalid", () => {
            const { container } = render(<Component {...defaultProps} />);
            const input = container.querySelector("input") as HTMLInputElement;

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
            const rollupsWagmi = await import("@cartesi/rollups-wagmi");
            const mockedHook = vi.fn().mockReturnValue({
                ...rollupsWagmi.useSimulateInputBoxAddInput,
                loading: false,
                error: null,
            });
            rollupsWagmi.useSimulateInputBoxAddInput = vi
                .fn()
                .mockImplementation(mockedHook);

            const { container } = render(<Component {...defaultProps} />);
            const input = container.querySelector("input") as HTMLInputElement;

            const [application] = applications;
            fireEvent.change(input, {
                target: {
                    value: application,
                },
            });

            expect(mockedHook).toHaveBeenLastCalledWith({
                args: [getAddress(application), "0x"],
                value: undefined,
                query: {
                    enabled: true,
                },
            });
        });
    });

    describe("Alerts", () => {
        it("should display alert for successful transaction", async () => {
            const wagmi = await import("wagmi");
            wagmi.useWaitForTransactionReceipt = vi.fn().mockReturnValue({
                ...wagmi.useWaitForTransactionReceipt,
                error: null,
                status: "success",
                isSuccess: true,
            });

            render(<Component {...defaultProps} />);
            expect(
                screen.getByText("Raw input sent successfully!"),
            ).toBeInTheDocument();
        });

        it("should display alert for failed transaction", async () => {
            const wagmi = await import("wagmi");
            const message = "User declined the transaction";
            wagmi.useWaitForTransactionReceipt = vi.fn().mockReturnValue({
                ...wagmi.useWaitForTransactionReceipt,
                error: {
                    message,
                },
                status: "error",
                isSuccess: false,
            });

            render(<Component {...defaultProps} />);
            expect(screen.getByText(message)).toBeInTheDocument();
        });
    });

    describe("ABI encoding", () => {
        it("should send ABI encoded data from existing JSON_ABI specification", async () => {
            const selectedApplication = applications[0] as string;
            const mockedWrite = vi.fn();
            const rollupsWagmi = await import("@cartesi/rollups-wagmi");
            rollupsWagmi.useSimulateInputBoxAddInput = vi.fn().mockReturnValue({
                ...rollupsWagmi.useSimulateInputBoxAddInput,
                data: {
                    request: {},
                },
                error: null,
            });
            rollupsWagmi.useWriteInputBoxAddInput = vi.fn().mockReturnValue({
                ...rollupsWagmi.useWriteInputBoxAddInput,
                writeContract: mockedWrite,
                execute: vi.fn(),
                reset: vi.fn(),
            });

            render(<Component {...defaultProps} />);
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

            expect(submitButton.hasAttribute("disabled")).toBe(false);
            fireEvent.click(submitButton);
            expect(mockedWrite).toHaveBeenCalled();
        });

        it("should validate form when attempting to submit invalid ABI encoded data from existing JSON_ABI specification", async () => {
            const selectedApplication = applications[0] as string;
            const mockedWrite = vi.fn();
            const rollupsWagmi = await import("@cartesi/rollups-wagmi");
            rollupsWagmi.useSimulateInputBoxAddInput = vi.fn().mockReturnValue({
                ...rollupsWagmi.useSimulateInputBoxAddInput,
                data: {
                    request: {},
                },
                error: null,
            });
            rollupsWagmi.useWriteInputBoxAddInput = vi.fn().mockReturnValue({
                ...rollupsWagmi.useWriteInputBoxAddInput,
                writeContract: mockedWrite,
                execute: vi.fn(),
                reset: vi.fn(),
            });

            render(<Component {...defaultProps} />);
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
            const selectedApplication = applications[0] as string;
            const mockedWrite = vi.fn();
            const rollupsWagmi = await import("@cartesi/rollups-wagmi");
            rollupsWagmi.useSimulateInputBoxAddInput = vi.fn().mockReturnValue({
                ...rollupsWagmi.useSimulateInputBoxAddInput,
                data: {
                    request: {},
                },
                error: null,
            });
            rollupsWagmi.useWriteInputBoxAddInput = vi.fn().mockReturnValue({
                ...rollupsWagmi.useWriteInputBoxAddInput,
                writeContract: mockedWrite,
                execute: vi.fn(),
                reset: vi.fn(),
            });

            render(<Component {...defaultProps} />);
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
            const selectedApplication = applications[0] as string;
            const mockedWrite = vi.fn();
            const rollupsWagmi = await import("@cartesi/rollups-wagmi");
            rollupsWagmi.useSimulateInputBoxAddInput = vi.fn().mockReturnValue({
                ...rollupsWagmi.useSimulateInputBoxAddInput,
                data: {
                    request: {},
                },
                error: null,
            });
            rollupsWagmi.useWriteInputBoxAddInput = vi.fn().mockReturnValue({
                ...rollupsWagmi.useWriteInputBoxAddInput,
                writeContract: mockedWrite,
                execute: vi.fn(),
                reset: vi.fn(),
            });

            render(<Component {...defaultProps} />);
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
                    "Unknown signature. Details: invalid-value Version: abitype@1.0.0",
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
            const selectedApplication = applications[0] as string;
            const mockedWrite = vi.fn();
            const rollupsWagmi = await import("@cartesi/rollups-wagmi");
            rollupsWagmi.useSimulateInputBoxAddInput = vi.fn().mockReturnValue({
                ...rollupsWagmi.useSimulateInputBoxAddInput,
                data: {
                    request: {},
                },
                error: null,
            });
            rollupsWagmi.useWriteInputBoxAddInput = vi.fn().mockReturnValue({
                ...rollupsWagmi.useWriteInputBoxAddInput,
                writeContract: mockedWrite,
                execute: vi.fn(),
                reset: vi.fn(),
            });

            render(<Component {...defaultProps} />);
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
            const selectedApplication = applications[0] as string;
            const mockedWrite = vi.fn();
            const rollupsWagmi = await import("@cartesi/rollups-wagmi");
            rollupsWagmi.useSimulateInputBoxAddInput = vi.fn().mockReturnValue({
                ...rollupsWagmi.useSimulateInputBoxAddInput,
                data: {
                    request: {},
                },
                error: null,
            });
            rollupsWagmi.useWriteInputBoxAddInput = vi.fn().mockReturnValue({
                ...rollupsWagmi.useWriteInputBoxAddInput,
                writeContract: mockedWrite,
                execute: vi.fn(),
                reset: vi.fn(),
            });

            render(<Component {...defaultProps} />);
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
                    "Invalid ABI parameter. Details: invalid-value Version: abitype@1.0.0",
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
        it("should reset form after successful submission", async () => {
            const mantineContext = await import(
                "../../src/GenericInputForm/context"
            );
            const [application] = applications;
            const resetMock = vi.fn();

            vi.spyOn(mantineContext, "useForm").mockReturnValue({
                getTransformedValues: () => ({
                    address: getAddress(application),
                    rawInput: "0x",
                }),
                getInputProps: () => ({
                    value: "",
                }),
                isValid: () => true,
                errors: {},
                setFieldValue: () => "",
                reset: resetMock,
            } as any);

            const wagmi = await import("wagmi");
            wagmi.useWaitForTransactionReceipt = vi.fn().mockReturnValue({
                ...wagmi.useWaitForTransactionReceipt,
                error: null,
                isSuccess: true,
            });

            render(<Component {...defaultProps} />);
            expect(resetMock).toHaveBeenCalled();
        });
    });
});
