import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterAll, describe, it } from "vitest";
import { EtherDepositForm } from "../src/EtherDepositForm";
import withMantineTheme from "./utils/WithMantineTheme";
import { getAddress } from "viem";
import {
    useSimulateEtherPortalDepositEther,
    useWriteEtherPortalDepositEther,
} from "@cartesi/rollups-wagmi";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";

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
    onSuccess: () => undefined,
};

vi.mock("@cartesi/rollups-wagmi");
const useSimulateEtherPortalDepositEtherMock = vi.mocked(
    useSimulateEtherPortalDepositEther,
    { partial: true },
);
const useWriteEtherPortalDepositEtherMock = vi.mocked(
    useWriteEtherPortalDepositEther,
    { partial: true },
);

vi.mock("wagmi");
const useWaitForTransactionReceiptMock = vi.mocked(
    useWaitForTransactionReceipt,
    { partial: true },
);
const useAccountMock = vi.mocked(useAccount, { partial: true });

vi.mock("viem", async () => {
    const actual = await vi.importActual("viem");
    return {
        ...(actual as any),
        getAddress: (address: string) => address,
    };
});

const useSimulateEtherPortalDepositEtherData = {
    data: {
        request: {},
    },
    config: {},
    reset: vi.fn(),
} as any;

const useWriteEtherPortalDepositEtherData = {
    wait: vi.fn(),
    reset: vi.fn(),
};

describe("Rollups EtherDepositForm", () => {
    beforeEach(() => {
        useSimulateEtherPortalDepositEtherMock.mockReturnValue(
            useSimulateEtherPortalDepositEtherData,
        );
        useWriteEtherPortalDepositEtherMock.mockReturnValue(
            useWriteEtherPortalDepositEtherData,
        );
        useWaitForTransactionReceiptMock.mockReturnValue({});
        useAccountMock.mockReturnValue({
            chain: {
                nativeCurrency: {
                    decimals: 18,
                } as any,
            },
        } as any);
    });
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

        it("should correctly format extra data", () => {
            const mockedHook = vi.fn().mockReturnValue({
                ...useSimulateEtherPortalDepositEtherData,
                loading: false,
                error: null,
            });
            useSimulateEtherPortalDepositEtherMock.mockImplementation(
                mockedHook,
            );

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

        it("should invoke write function when send button is clicked", () => {
            const selectedApplication = applications[1];
            const mockedWrite = vi.fn();
            useSimulateEtherPortalDepositEtherMock.mockReturnValue({
                ...useSimulateEtherPortalDepositEtherData,
                data: {
                    request: {},
                },
                loading: false,
                error: null,
            });
            useWriteEtherPortalDepositEtherMock.mockReturnValue({
                ...useWriteEtherPortalDepositEtherData,
                writeContract: mockedWrite,
                reset: vi.fn(),
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

        it("should invoke onSearchApplications function after successful deposit", () => {
            useWaitForTransactionReceiptMock.mockReturnValue({
                error: null,
                status: "success",
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

        it('should enable "useSimulateEtherPortalDepositEther" only when the form is valid', () => {
            const mockedHook = vi.fn().mockReturnValue({
                ...useSimulateEtherPortalDepositEtherData,
                loading: false,
                error: null,
            });
            useSimulateEtherPortalDepositEtherMock.mockImplementation(
                mockedHook,
            );

            const { container } = render(<Component {...defaultProps} />);
            const applicationsInput = container.querySelector(
                "input",
            ) as HTMLInputElement;
            const amountInput = container.querySelectorAll(
                "input",
            )[1] as HTMLInputElement;
            const textarea = container.querySelector(
                "textarea",
            ) as HTMLTextAreaElement;

            const [application] = applications;

            fireEvent.change(applicationsInput, {
                target: {
                    value: "",
                },
            });

            fireEvent.change(amountInput, {
                target: {
                    value: "0.1",
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
                value: 100000000000000000n,
            });

            fireEvent.change(applicationsInput, {
                target: {
                    value: application,
                },
            });

            fireEvent.change(amountInput, {
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
                args: [getAddress(application), "0x"],
                query: {
                    enabled: false,
                },
                value: undefined,
            });

            fireEvent.change(applicationsInput, {
                target: {
                    value: application,
                },
            });

            fireEvent.change(amountInput, {
                target: {
                    value: "0.1",
                },
            });

            fireEvent.change(textarea, {
                target: {
                    value: "",
                },
            });

            expect(mockedHook).toHaveBeenLastCalledWith({
                args: ["0x60a7048c3136293071605a4eaffef49923e981cc", "0x"],
                query: {
                    enabled: false,
                },
                value: 100000000000000000n,
            });

            fireEvent.change(applicationsInput, {
                target: {
                    value: application,
                },
            });

            fireEvent.change(amountInput, {
                target: {
                    value: "0.1",
                },
            });

            fireEvent.change(textarea, {
                target: {
                    value: "0x123",
                },
            });

            expect(mockedHook).toHaveBeenLastCalledWith({
                args: ["0x60a7048c3136293071605a4eaffef49923e981cc", "0x123"],
                query: {
                    enabled: true,
                },
                value: 100000000000000000n,
            });
        });

        it("should invoke onSuccess callback after successful deposit", () => {
            useWaitForTransactionReceiptMock.mockReturnValue({
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
                        screen.getByText(
                            "This is a deposit to an undeployed application.",
                        ),
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

        it("should correctly format address", () => {
            const mockedHook = vi.fn().mockReturnValue({
                ...useSimulateEtherPortalDepositEtherData,
                loading: false,
                error: null,
            });
            useSimulateEtherPortalDepositEtherMock.mockImplementation(
                mockedHook,
            );

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
                query: {
                    enabled: false,
                },
                value: undefined,
            });
        });
    });

    describe("Alerts", () => {
        it("should display alert for successful transaction", () => {
            useWaitForTransactionReceiptMock.mockReturnValue({
                error: null,
                status: "success",
                isSuccess: true,
            });

            render(<Component {...defaultProps} />);
            expect(
                screen.getByText("Ether deposited successfully!"),
            ).toBeInTheDocument();
        });

        it("should display alert for failed transaction", () => {
            const message = "User declined the transaction";
            useWaitForTransactionReceiptMock.mockReturnValue({
                error: {
                    message,
                },
                status: "error",
            } as any);

            render(<Component {...defaultProps} />);
            expect(screen.getByText(message)).toBeInTheDocument();
        });
    });

    describe("Amount input", () => {
        it("should correctly process small decimal numbers", () => {
            const mockedHook = vi.fn().mockReturnValue({
                ...useSimulateEtherPortalDepositEther,
                data: {
                    request: {},
                },
                loading: false,
                error: null,
            });
            useSimulateEtherPortalDepositEtherMock.mockImplementation(
                mockedHook,
            );

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
                value: 100000000000n,
                query: {
                    enabled: false,
                },
            });
        });
    });
});
