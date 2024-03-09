import { fireEvent, render, screen } from "@testing-library/react";
import { afterAll, describe, it } from "vitest";
import { EtherDepositForm } from "../src/EtherDepositForm";
import withMantineTheme from "./utils/WithMantineTheme";
import { getAddress } from "viem";

const Component = withMantineTheme(EtherDepositForm);

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
        usePrepareEtherPortalDepositEther: () => ({
            config: {},
        }),
        useEtherPortalDepositEther: () => ({
            data: {},
            wait: vi.fn(),
        }),
    };
});

vi.mock("wagmi", async () => {
    return {
        useWaitForTransaction: () => ({}),
        useNetwork: () => ({
            chain: {
                nativeCurrency: {
                    decimals: 18,
                },
            },
        }),
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

describe("Rollups EtherDepositForm", () => {
    afterAll(() => {
        vi.restoreAllMocks();
    });

    describe("Extra data textarea", () => {
        it("should display correct label", () => {
            render(<Component {...defaultProps} />);

            expect(screen.getByText("Extra data")).toBeInTheDocument();
        });

        it("should display correct description", () => {
            render(<Component {...defaultProps} />);

            expect(
                screen.getByText(
                    "Extra execution layer data handled by the application",
                ),
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

        it("should correctly format extra data", async () => {
            const rollupsWagmi = await import("@cartesi/rollups-wagmi");
            const mockedHook = vi.fn().mockReturnValue({
                ...rollupsWagmi.usePrepareEtherPortalDepositEther,
                loading: false,
                error: null,
            });
            rollupsWagmi.usePrepareEtherPortalDepositEther = vi
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
                enabled: false,
                value: undefined,
            });
        });
    });

    describe("Send button", () => {
        it("should be disabled when extra data is not hex", () => {
            const { container } = render(<Component {...defaultProps} />);
            const textarea = container.querySelector(
                "textarea",
            ) as HTMLTextAreaElement;
            const buttons = container.querySelectorAll("button");
            const submitButton = buttons[1] as HTMLButtonElement;

            fireEvent.change(textarea, {
                target: {
                    value: "",
                },
            });
            fireEvent.blur(textarea);

            expect(submitButton.hasAttribute("disabled")).toBe(true);
        });

        it("should invoke write function when send button is clicked", async () => {
            const selectedApplication = applications[1];
            const mockedWrite = vi.fn();
            const rollupsWagmi = await import("@cartesi/rollups-wagmi");
            rollupsWagmi.usePrepareEtherPortalDepositEther = vi
                .fn()
                .mockReturnValue({
                    ...rollupsWagmi.usePrepareEtherPortalDepositEther,
                    loading: false,
                    error: null,
                });
            rollupsWagmi.useEtherPortalDepositEther = vi.fn().mockReturnValue({
                ...rollupsWagmi.useEtherPortalDepositEther,
                write: mockedWrite,
            });

            const { container } = render(<Component {...defaultProps} />);
            const buttons = container.querySelectorAll("button");
            const submitButton = buttons[1] as HTMLButtonElement;

            const inputs = container.querySelectorAll("input");
            const applicationInput = inputs[0] as HTMLInputElement;
            const amountInput = inputs[1] as HTMLInputElement;
            applicationInput.setAttribute("value", selectedApplication);

            fireEvent.change(applicationInput, {
                target: {
                    value: selectedApplication,
                },
            });

            fireEvent.change(amountInput, {
                target: {
                    value: "1",
                },
            });

            fireEvent.blur(amountInput);
            expect(submitButton.hasAttribute("disabled")).toBe(false);

            fireEvent.click(submitButton);
            expect(mockedWrite).toHaveBeenCalled();
        });

        it("should invoke onSearchApplications function after successful deposit", async () => {
            const wagmi = await import("wagmi");
            wagmi.useWaitForTransaction = vi.fn().mockReturnValue({
                ...wagmi.useWaitForTransaction,
                error: null,
                status: "success",
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

        it("should display alert for unemployed application", () => {
            const { container } = render(<Component {...defaultProps} />);
            const input = container.querySelector("input") as HTMLInputElement;

            fireEvent.change(input, {
                target: {
                    value: "0x60a7048c3136293071605a4eaffef49923e981fe",
                },
            });

            expect(
                screen.getByText(
                    "This is a deposit to an undeployed application.",
                ),
            ).toBeInTheDocument();
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
                ...rollupsWagmi.usePrepareEtherPortalDepositEther,
                loading: false,
                error: null,
            });
            rollupsWagmi.usePrepareEtherPortalDepositEther = vi
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
                enabled: false,
                value: undefined,
            });
        });
    });

    describe("Alerts", () => {
        it("should display alert for successful transaction", async () => {
            const wagmi = await import("wagmi");
            wagmi.useWaitForTransaction = vi.fn().mockReturnValue({
                ...wagmi.useWaitForTransaction,
                error: null,
                status: "success",
            });

            render(<Component {...defaultProps} />);
            expect(
                screen.getByText("Ether deposited successfully!"),
            ).toBeInTheDocument();
        });

        it("should display alert for failed transaction", async () => {
            const wagmi = await import("wagmi");
            const message = "User declined the transaction";
            wagmi.useWaitForTransaction = vi.fn().mockReturnValue({
                ...wagmi.useWaitForTransaction,
                error: {
                    message,
                },
                status: "error",
            });

            render(<Component {...defaultProps} />);
            expect(screen.getByText(message)).toBeInTheDocument();
        });
    });

    describe("Amount input", () => {
        it("should correctly process small decimal numbers", async () => {
            const rollupsWagmi = await import("@cartesi/rollups-wagmi");
            const mockedHook = vi.fn().mockReturnValue({
                ...rollupsWagmi.usePrepareEtherPortalDepositEther,
                loading: false,
                error: null,
            });
            rollupsWagmi.usePrepareEtherPortalDepositEther = vi
                .fn()
                .mockImplementation(mockedHook);

            const { container } = render(<Component {...defaultProps} />);
            const amountInput = container.querySelector(
                '[type="number"]',
            ) as HTMLInputElement;

            fireEvent.change(amountInput, {
                target: {
                    value: "0.0000001",
                },
            });

            expect(mockedHook).toHaveBeenLastCalledWith({
                args: ["0x0000000000000000000000000000000000000000", "0x"],
                enabled: false,
                value: 100000000000n,
            });
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
            wagmi.useWaitForTransaction = vi.fn().mockReturnValue({
                ...wagmi.useWaitForTransaction,
                error: null,
                status: "success",
            });

            render(<Component {...defaultProps} />);
            expect(resetMock).toHaveBeenCalled();
        });
    });
});
