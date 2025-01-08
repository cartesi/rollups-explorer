import {
    useSimulateEtherPortalDepositEther,
    useWriteEtherPortalDepositEther,
} from "@cartesi/rollups-wagmi";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { act } from "react";
import { getAddress } from "viem";
import { beforeEach, describe, it } from "vitest";
import { useAccount, useBalance, useWaitForTransactionReceipt } from "wagmi";
import { EtherDepositForm } from "../src/EtherDepositForm";
import withMantineTheme from "./utils/WithMantineTheme";
import { factoryWaitStatus } from "./utils/helpers";

vi.mock("wagmi");
vi.mock("viem", async () => {
    const actual = await vi.importActual("viem");
    return {
        ...(actual as any),
        getAddress: (address: string) => address,
    };
});

vi.mock("@cartesi/rollups-wagmi");

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

const selectApp = (app: string) => {
    const appInput = screen.getByTestId("application-input");

    return fireEvent.change(appInput, {
        target: {
            value: app.toLowerCase(),
        },
    });
};

const setRequiredValues = async (app: string, amount = "0.2") => {
    selectApp(app);

    fireEvent.change(screen.getByTestId("amount-input"), {
        target: { value: amount },
    });

    await waitFor(() => expect(screen.getByText("Advanced")).toBeVisible());
    fireEvent.click(screen.getByText("Advanced"));
    await waitFor(() => expect(screen.getByText("Extra data")).toBeVisible());
};

const useWaitForTransactionReceiptMock = vi.mocked(
    useWaitForTransactionReceipt,
    { partial: true },
);

const useSimulateDepositEtherMock = vi.mocked(
    useSimulateEtherPortalDepositEther,
    { partial: true },
);
const useWriteDepositEtherMock = vi.mocked(useWriteEtherPortalDepositEther, {
    partial: true,
});
const useAccountMock = vi.mocked(useAccount, { partial: true });
const useBalanceMock = vi.mocked(useBalance, { partial: true });
const balanceRefetchMock = vi.fn();

describe("Rollups EtherDepositForm", () => {
    beforeEach(() => {
        useSimulateDepositEtherMock.mockReturnValue({
            data: undefined,
            status: "success",
            isLoading: false,
            isFetching: false,
            isSuccess: true,
        });

        useWriteDepositEtherMock.mockReturnValue({
            writeContract: vi.fn(),
            reset: vi.fn(),
            status: "idle",
            data: undefined,
        });

        useWaitForTransactionReceiptMock.mockReturnValue({
            data: undefined,
            isLoading: false,
            isSuccess: false,
        });
        useAccountMock.mockReturnValue({
            chain: {
                nativeCurrency: {
                    name: "ether",
                    symbol: "ETH",
                    decimals: 18,
                },
            } as any,
        });
        useBalanceMock.mockReturnValue({
            data: {
                value: 456632268985698099n,
                decimals: 18,
            },
            refetch: balanceRefetchMock,
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
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

            expect(textarea.getAttribute("aria-invalid")).toBe("false");
            expect(() => screen.getByText("Invalid hex string")).toThrow(
                "Unable to find an element",
            );
        });

        it("should correctly format extra data", async () => {
            render(<Component {...defaultProps} />);
            const execLayerDataInput = screen.getByTestId(
                "eth-extra-data-input",
            );

            const hexValue = "0x123123";
            fireEvent.change(execLayerDataInput, {
                target: {
                    value: hexValue,
                },
            });

            expect(useSimulateDepositEtherMock).toHaveBeenLastCalledWith({
                args: ["0x0000000000000000000000000000000000000000", hexValue],
                query: {
                    enabled: false,
                },
                value: undefined,
            });
        });
    });

    describe("Send button", () => {
        it("should be disabled when extra data is not hex", async () => {
            useSimulateDepositEtherMock.mockReturnValue({
                status: "success",
                isLoading: false,
                error: null,
                data: {
                    request: {},
                },
            });

            const { container } = render(<Component {...defaultProps} />);

            await setRequiredValues(applications[0]);

            const depositButton = screen.getByText("Deposit").closest("button");
            const textarea = screen.getByTestId("eth-extra-data-input");

            expect(depositButton?.hasAttribute("disabled")).toBe(false);

            fireEvent.change(textarea, {
                target: {
                    value: "",
                },
            });

            expect(depositButton?.hasAttribute("disabled")).toBe(true);
        });

        it("should invoke write function when send button is clicked", async () => {
            const mockedWrite = vi.fn();

            useSimulateDepositEtherMock.mockReturnValue({
                status: "success",
                isLoading: false,
                error: null,
                data: {
                    request: {},
                },
            });

            useWriteDepositEtherMock.mockReturnValue({
                writeContract: mockedWrite,
                reset: vi.fn(),
            });

            const selectedApplication = applications[1];
            render(<Component {...defaultProps} />);

            await setRequiredValues(selectedApplication, "0.1");
            const submitButton = screen.getByText("Deposit").closest("button");

            expect(submitButton?.hasAttribute("disabled") ?? true).toBe(false);

            fireEvent.click(submitButton!);
            expect(mockedWrite).toHaveBeenCalled();
        });

        it("should invoke onSearchApplications function after successful deposit", () => {
            useWaitForTransactionReceiptMock.mockReturnValue({
                data: {},
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

        it('should enable "useSimulateEtherPortalDepositEther" only when the form is valid', async () => {
            render(<Component {...defaultProps} />);

            const applicationsInput = screen.getByTestId("application-input");
            const amountInput = screen.getByTestId("amount-input");
            const textarea = screen.getByTestId("eth-extra-data-input");

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

            expect(useSimulateDepositEtherMock).toHaveBeenLastCalledWith({
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

            expect(useSimulateDepositEtherMock).toHaveBeenLastCalledWith({
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

            expect(useSimulateDepositEtherMock).toHaveBeenLastCalledWith({
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

            expect(useSimulateDepositEtherMock).toHaveBeenLastCalledWith({
                args: ["0x60a7048c3136293071605a4eaffef49923e981cc", "0x123"],
                query: {
                    enabled: true,
                },
                value: 100000000000000000n,
            });
        });

        it("should invoke onSuccess callback after successful deposit", () => {
            useWaitForTransactionReceiptMock.mockReturnValue({
                data: {},
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

            expect(input.getAttribute("aria-invalid")).toBe("true");
            expect(screen.getByText("Invalid application")).toBeInTheDocument();
        });

        it("should correctly format address", async () => {
            render(<Component {...defaultProps} />);
            const input = screen.getByTestId("application-input");

            const [application] = applications;
            fireEvent.change(input, {
                target: {
                    value: application,
                },
            });

            expect(useSimulateDepositEtherMock).toHaveBeenLastCalledWith({
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
                data: {},
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
                data: {},
                error: {
                    message,
                } as any,
                status: "error",
            });

            render(<Component {...defaultProps} />);
            expect(screen.getByText(message)).toBeInTheDocument();
        });
    });

    describe("Amount input", () => {
        it("should display the connected account's balance", () => {
            useSimulateDepositEtherMock.mockReturnValue({
                status: "success",
                isLoading: false,
                error: null,
                data: {
                    request: {},
                },
            });
            render(<Component {...defaultProps} />);

            expect(
                screen.getByText("Balance: 0.456632268985698099"),
            ).toBeVisible();

            expect(screen.getByText("Max")).toBeVisible();
        });

        it("should fill the amount input when clicking the max button", () => {
            render(<Component {...defaultProps} />);

            act(() => fireEvent.click(screen.getByText("Max")));

            expect(
                screen.getByDisplayValue("0.456632268985698099"),
            ).toBeVisible();
        });

        it("should not display the max option when the balance is zero", () => {
            useBalanceMock.mockReturnValue({
                data: {
                    value: 0n,
                    decimals: 18,
                },
                refetch: balanceRefetchMock,
            });

            render(<Component {...defaultProps} />);

            expect(screen.getByText("Balance: 0")).toBeVisible();
            expect(screen.queryByText("Max")).not.toBeInTheDocument();
        });

        it("should correctly process small decimal numbers", async () => {
            useSimulateDepositEtherMock.mockReturnValue({
                status: "success",
                isLoading: false,
                error: null,
                data: {
                    request: {},
                },
            });

            render(<Component {...defaultProps} />);

            const amountInput = screen.getByTestId("amount-input");

            fireEvent.change(amountInput, { target: { value: "0.0000001" } });

            expect(useSimulateDepositEtherMock).toHaveBeenLastCalledWith({
                args: ["0x0000000000000000000000000000000000000000", "0x"],
                value: 100000000000n,
                query: {
                    enabled: false,
                },
            });
        });

        it("should correctly validate amount based on available balance", () => {
            const balanceValue = 355943959031747438n;
            const formattedBalanceValue = "0.355943959031747438";
            useBalanceMock.mockReturnValue({
                data: {
                    value: balanceValue,
                    decimals: 18,
                },
            });

            const { container } = render(<Component {...defaultProps} />);
            const amountInput = container.querySelector(
                '[type="number"]',
            ) as HTMLInputElement;

            let value = 0.4;
            fireEvent.change(amountInput, {
                target: {
                    value: value.toString(),
                },
            });

            expect(
                screen.getByText(
                    `The amount ${value} exceeds your current balance of ${formattedBalanceValue} ETH`,
                ),
            ).toBeInTheDocument();

            value = 0.3;
            fireEvent.change(amountInput, {
                target: {
                    value: value.toString(),
                },
            });

            expect(() =>
                screen.getByText(
                    `The amount ${value} exceeds your current balance of ${formattedBalanceValue} ETH`,
                ),
            ).toThrow("Unable to find an element with the text");
        });
    });

    describe("Form", () => {
        it("should reset form after successful submission", async () => {
            // Emulate success and reset wait-status to avoid infinite loop.
            const depositWaitStatus = factoryWaitStatus();
            useWriteDepositEtherMock.mockReturnValue({
                status: "success",
                data: "0x0001",
                reset: () => {
                    depositWaitStatus.reset();
                },
            });

            useWaitForTransactionReceiptMock.mockImplementation((params) => {
                return params?.hash === "0x0001"
                    ? {
                          ...depositWaitStatus.props,
                          fetchStatus: "idle",
                          data: { transactionHash: "0x01" },
                      }
                    : {
                          fetchStatus: "idle",
                      };
            });

            useWaitForTransactionReceiptMock.mockReturnValue({
                data: {},
                error: null,
                isSuccess: true,
            });

            const onSearchMock = vi.fn();
            const onSuccessMock = vi.fn();

            render(
                <Component
                    {...defaultProps}
                    onSearchApplications={onSearchMock}
                    onSuccess={onSuccessMock}
                />,
            );

            await setRequiredValues(applications[0], "0.2");

            expect(onSearchMock).toHaveBeenCalledWith("");
            expect(onSuccessMock).toHaveBeenCalledWith({
                type: "ETHER",
                receipt: {},
            });
            expect(balanceRefetchMock).toHaveBeenCalled();
        });
    });
});
