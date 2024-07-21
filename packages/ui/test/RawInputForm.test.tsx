import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterAll, describe, it } from "vitest";
import { RawInputForm } from "../src/RawInputForm";
import withMantineTheme from "./utils/WithMantineTheme";
import { getAddress, stringToHex } from "viem";

const Component = withMantineTheme(RawInputForm);

const applications = [
    "0x60a7048c3136293071605a4eaffef49923e981cc",
    "0x70ac08179605af2d9e75782b8decdd3c22aa4d0c",
    "0x71ab24ee3ddb97dc01a161edf64c8d51102b0cd3",
];

const defaultProps = {
    applications,
    isLoadingApplications: false,
    onSearchApplications: () => undefined,
};

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
    };
});

vi.mock("@mantine/form", async () => {
    const actual = await vi.importActual("@mantine/form");
    return {
        ...(actual as any),
        useForm: (actual as any).useForm,
    };
});

describe("Rollups RawInputForm", () => {
    afterAll(() => {
        vi.restoreAllMocks();
    });

    describe("Raw input textarea", () => {
        it("should display correct label for raw input", () => {
            render(<Component {...defaultProps} />);

            expect(screen.getByText("Raw input")).toBeInTheDocument();
        });

        it("should display correct description for raw input", () => {
            render(<Component {...defaultProps} />);

            expect(
                screen.getByText("Raw input for the application"),
            ).toBeInTheDocument();
        });

        it("should display error when value is not hex", () => {
            const { container } = render(<Component {...defaultProps} />);
            const textarea = container.querySelector(
                "textarea",
            ) as HTMLTextAreaElement;

            fireEvent.change(textarea, {
                target: {
                    value: "",
                },
            });

            fireEvent.blur(textarea);

            expect(textarea.getAttribute("aria-invalid")).toBe("true");
            expect(screen.getByText("Invalid hex string")).toBeInTheDocument();
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

    describe("Form", () => {
        it("should reset form after successful submission", async () => {
            const mantineForm = await import("@mantine/form");
            const [application] = applications;
            const resetMock = vi.fn();
            vi.spyOn(mantineForm, "useForm").mockReturnValue({
                getTransformedValues: () => ({
                    address: getAddress(application),
                    rawInput: "0x",
                }),
                isValid: () => true,
                getInputProps: () => {},
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
