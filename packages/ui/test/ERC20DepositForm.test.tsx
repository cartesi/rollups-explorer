import {
    useSimulateErc20Approve,
    useWriteErc20Approve,
} from "@cartesi/rollups-wagmi";
import {
    fireEvent,
    getByText,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, it, vi } from "vitest";
import {
    useReadContracts,
    useSimulateContract,
    useWaitForTransactionReceipt,
    useWriteContract,
} from "wagmi";
import { ERC20DepositForm } from "../src";
import { Application } from "../src/commons/interfaces";
import withMantineTheme from "./utils/WithMantineTheme";
import { depositWaitStatus } from "./utils/helpers";
import { applications, tokens } from "./utils/stubs";

const Component = withMantineTheme(ERC20DepositForm);

const defaultProps = {
    applications: applications,
    tokens,
    isLoadingApplications: false,
    onSearchApplications: () => undefined,
    onSearchTokens: () => undefined,
    onSuccess: () => undefined,
};

vi.mock("wagmi", async () => {
    const actual = await vi.importActual("wagmi");
    return {
        ...actual,
        useSimulateContract: vi.fn(),
        useWriteContract: vi.fn(),
        useWaitForTransactionReceipt: vi.fn(),
        useReadContracts: vi.fn(),
        useAccount: () => ({
            address: "0x8FD78976f8955D13bAA4fC99043208F4EC020D7E",
        }),
    };
});

vi.mock("../src/hooks/useWatchQueryOnBlockChange", () => ({
    default: vi.fn(),
}));

vi.mock("viem", async () => {
    const actual = await vi.importActual("viem");
    return {
        ...actual,
        getAddress: (address: string) => address,
    };
});

vi.mock("@cartesi/rollups-wagmi", async () => {
    const actual = await vi.importActual("@cartesi/rollups-wagmi");
    return {
        ...actual,
        useSimulateErc20Approve: vi.fn(),
        useWriteErc20Approve: vi.fn(),
    };
});

const useSimulateContractMock = vi.mocked(useSimulateContract, {
    partial: true,
});
const useSimulateErc20ApproveMock = vi.mocked(useSimulateErc20Approve, {
    partial: true,
});
const useWriteErc20ApproveMock = vi.mocked(useWriteErc20Approve, {
    partial: true,
});
const useReadContractsMock = vi.mocked(useReadContracts, { partial: true });
const useWriteContractMock = vi.mocked(useWriteContract, { partial: true });
const useWaitForTransactionReceiptMock = vi.mocked(
    useWaitForTransactionReceipt,
    { partial: true },
);

const fillFormValues = async (
    app: Application,
    erc20Address: string,
    amount: string,
) => {
    const appInput = screen.getByTestId("application-input");

    fireEvent.change(appInput, {
        target: {
            value: app.address.toLowerCase(),
        },
    });

    await waitFor(() => expect(screen.getByText("ERC-20")).toBeVisible());

    fireEvent.change(screen.getByTestId("erc20address-input"), {
        target: { value: erc20Address },
    });

    await waitFor(() => expect(screen.getByText("Amount")).toBeVisible());

    fireEvent.change(screen.getByTestId("amount-input"), {
        target: { value: amount },
    });
};

const cast = (obj: any, func: any) => obj as ReturnType<typeof func>;

describe("ERC20 Portal Deposit", () => {
    const defaultReturnForWriteFn = {
        data: undefined,
        status: "idle",
        writeContract: vi.fn(),
        reset: vi.fn(),
    };

    const defaultReturnForSimulateFn = {
        data: undefined,
        status: "success",
        isLoading: false,
        isFetching: false,
        isSuccess: true,
        error: null,
    };

    beforeEach(() => {
        useSimulateErc20ApproveMock.mockReturnValue({
            ...cast(defaultReturnForSimulateFn, useSimulateErc20ApproveMock),
        });

        useWriteErc20ApproveMock.mockReturnValue({
            ...cast(defaultReturnForWriteFn, useWriteErc20ApproveMock),
        });

        useSimulateContractMock.mockReturnValue({
            ...cast(defaultReturnForSimulateFn, useSimulateContractMock),
        });

        useWriteContractMock.mockReturnValue({
            ...cast(defaultReturnForWriteFn, useWriteContractMock),
        });

        useWaitForTransactionReceiptMock.mockReturnValue({
            data: undefined,
            isLoading: false,
            isSuccess: false,
        });

        useReadContractsMock.mockReturnValue({
            isLoading: false,
            isSuccess: true,
            data: [
                // decimals
                {
                    result: undefined,
                    error: undefined,
                },
                //symbol
                {
                    result: undefined,
                    error: undefined,
                },
                // allowance
                {
                    result: undefined,
                    error: undefined,
                },
                // balance
                {
                    result: undefined,
                    error: undefined,
                },
            ],
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("should display only the application field initially", () => {
        render(<Component {...defaultProps} />);

        expect(screen.getByText("Application")).toBeVisible();
        expect(
            screen.getByText("The application smart contract address"),
        ).toBeVisible();

        expect(screen.queryByText("ERC-20")).not.toBeInTheDocument();
    });

    it("should display all fields after fill application and erc-20 addresses", async () => {
        render(
            <Component {...defaultProps} applications={[applications[0]]} />,
        );

        await fillFormValues(applications[0], tokens[0], "100");

        fireEvent.click(screen.getByText("Advanced"));

        await waitFor(() =>
            expect(screen.getByText("Extra data")).toBeVisible(),
        );

        expect(screen.getByText("ERC-20")).toBeVisible();
        expect(
            screen.getByText("The ERC-20 smart contract address"),
        ).toBeVisible();
        expect(screen.getByText("Amount")).toBeVisible();
        expect(screen.getByText("Amount of tokens to deposit")).toBeVisible();
        expect(screen.getByText("Balance:")).toBeVisible();
        expect(screen.getByText("Allowance:")).toBeVisible();
        expect(
            screen.getByText(
                "Extra execution layer data handled by the application",
            ),
        ).toBeVisible();
        expect(screen.getByText("Advanced")).toBeVisible();
        expect(screen.getByText("Approve")).toBeVisible();
        expect(screen.getByText("Deposit")).toBeVisible();
    });

    it("should display required field messages for the Application and ERC-20 addresses", async () => {
        render(
            <Component {...defaultProps} applications={[applications[0]]} />,
        );

        const input = screen.getByTestId("application-input");

        fireEvent.change(input, {
            target: { value: " " },
        });

        expect(screen.getByText("Invalid Application address")).toBeVisible();

        fireEvent.change(input, { target: { value: "" } });

        expect(
            screen.getByText("Application address is required!"),
        ).toBeVisible();

        const erc20Input = screen.getByTestId("erc20address-input");

        fireEvent.change(erc20Input, {
            target: { value: " " },
        });

        expect(screen.getByText("Invalid ERC20 address")).toBeVisible();

        fireEvent.change(erc20Input, { target: { value: "" } });

        expect(screen.getByText("ERC20 address is required!")).toBeVisible();
    });

    it("should display invalid amount message for amount field", async () => {
        render(
            <Component {...defaultProps} applications={[applications[0]]} />,
        );

        await fillFormValues(applications[0], tokens[0], "-1");

        expect(screen.getByText("Invalid amount")).toBeVisible();
    });

    it("should display invalid hex for extra-data field", async () => {
        render(
            <Component {...defaultProps} applications={[applications[0]]} />,
        );

        await fillFormValues(applications[0], tokens[0], "10");

        fireEvent.click(screen.getByText("Advanced"));

        await waitFor(() =>
            expect(screen.getByText("Extra data")).toBeVisible(),
        );

        fireEvent.change(screen.getByTestId("extra-data-input"), {
            target: { value: "not-a-hex-string" },
        });

        expect(screen.getByText("Invalid hex string")).toBeVisible();
    });

    describe("Warnings", () => {
        it("should display warning for undeployed Application address", async () => {
            render(<Component {...defaultProps} applications={[]} />);

            fireEvent.change(screen.getByTestId("application-input"), {
                target: { value: "0x60a7048c3136293071605a4eaffef49923e981fe" },
            });

            await waitFor(() =>
                expect(
                    screen.getByText(
                        "This is a deposit to an undeployed application.",
                    ),
                ).toBeVisible(),
            );
        });

        it("should display warning for an ERC-20 address not yet indexed", async () => {
            render(
                <Component
                    {...defaultProps}
                    applications={[applications[0]]}
                    tokens={[]}
                />,
            );

            await fillFormValues(applications[0], tokens[0], "10");

            await waitFor(() =>
                expect(
                    screen.getByText(
                        "This is the first deposit of that token.",
                    ),
                ).toBeVisible(),
            );
        });
    });

    describe("When the application is undeployed", () => {
        it("should display rollup-version options to be chosen", async () => {
            render(<Component {...defaultProps} applications={[]} />);

            fireEvent.change(screen.getByTestId("application-input"), {
                target: { value: applications[0].address },
            });

            await waitFor(() =>
                expect(
                    screen.getByText(
                        "This is a deposit to an undeployed application.",
                    ),
                ).toBeVisible(),
            );

            expect(screen.getByText("Cartesi Rollups version")).toBeVisible();
            expect(
                screen.getByText(
                    "Set the rollup version to call the correct contracts.",
                ),
            ).toBeVisible();

            expect(screen.queryByText("ERC-20")).not.toBeInTheDocument();
            expect(screen.queryByText("Amount")).not.toBeInTheDocument();
            expect(screen.queryByText("Advanced")).not.toBeInTheDocument();
            expect(screen.queryByText("Approve")).not.toBeInTheDocument();
            expect(screen.queryByText("Deposit")).not.toBeInTheDocument();
        });

        it("should display the rest of the fields after choosing the Rollup version", async () => {
            render(<Component {...defaultProps} applications={[]} />);

            fireEvent.change(screen.getByTestId("application-input"), {
                target: { value: applications[0].address },
            });

            await waitFor(() =>
                expect(
                    screen.getByText(
                        "This is a deposit to an undeployed application.",
                    ),
                ).toBeVisible(),
            );

            const options = screen.getByRole("radiogroup");

            fireEvent.click(getByText(options, "Rollup v1"));

            await waitFor(() =>
                expect(screen.getByText("ERC-20")).toBeVisible(),
            );

            expect(screen.getByText("Amount")).toBeVisible();
            expect(screen.getByText("Advanced")).toBeVisible();
            expect(screen.getByText("Approve")).toBeVisible();
            expect(screen.getByText("Deposit")).toBeVisible();
        });
    });

    describe("Approve", () => {
        it("should be able to click the approve when the amount is covered by the allowance", async () => {
            useReadContractsMock.mockReturnValue({
                isLoading: false,
                isSuccess: true,
                data: [
                    // decimals
                    {
                        result: 18,
                        error: undefined,
                    },
                    //symbol
                    {
                        result: "SIM20",
                        error: undefined,
                    },
                    // allowance
                    {
                        result: 0n,
                        error: undefined,
                    },
                    // balance
                    {
                        result: 1000000000000000000000n,
                        error: undefined,
                    },
                ],
            });

            const writeContract = vi.fn();

            useSimulateErc20ApproveMock.mockReturnValue({
                ...cast(
                    defaultReturnForSimulateFn,
                    useSimulateErc20ApproveMock,
                ),
                data: {
                    request: {},
                },
            });

            useWriteErc20ApproveMock.mockReturnValue({
                writeContract,
            });

            const app = applications[0];
            const token = tokens[0];
            render(
                <Component
                    {...defaultProps}
                    applications={[app]}
                    tokens={[token]}
                />,
            );

            await fillFormValues(app, token, "10");

            const approveBtn = screen.getByText("Approve");

            expect(approveBtn.closest("button")).not.toBeDisabled();

            fireEvent.click(approveBtn);

            expect(writeContract).toHaveBeenCalledTimes(1);
        });

        it("should be disabled when the amount is smaller than the allowance", async () => {
            useReadContractsMock.mockReturnValue({
                isLoading: false,
                isSuccess: true,
                data: [
                    // decimals
                    {
                        result: 18,
                        error: undefined,
                    },
                    //symbol
                    {
                        result: "SIM20",
                        error: undefined,
                    },
                    // allowance
                    {
                        result: 3000000000000000000n,
                        error: undefined,
                    },
                    // balance
                    {
                        result: 1000000000000000000000n,
                        error: undefined,
                    },
                ],
            });

            const app = applications[0];
            const token = tokens[0];
            render(
                <Component
                    {...defaultProps}
                    applications={[app]}
                    tokens={[token]}
                />,
            );

            await fillFormValues(app, token, "10");

            expect(
                screen.getByText("Approve").closest("button"),
            ).not.toBeDisabled();

            await fillFormValues(app, token, "2");

            expect(
                screen.getByText("Approve").closest("button"),
            ).toBeDisabled();
        });
    });

    describe("Deposit", () => {
        beforeEach(() => {
            useReadContractsMock.mockReturnValue({
                isLoading: false,
                isSuccess: true,
                data: [
                    // decimals
                    {
                        result: 18,
                        error: undefined,
                    },
                    //symbol
                    {
                        result: "SIM20",
                        error: undefined,
                    },
                    // allowance
                    {
                        result: 3000000000000000000n,
                        error: undefined,
                    },
                    // balance
                    {
                        result: 1000000000000000000000n,
                        error: undefined,
                    },
                ],
            });

            useSimulateContractMock.mockReturnValue({
                ...cast(defaultReturnForSimulateFn, useSimulateContractMock),
                data: {
                    request: {},
                },
            });
        });

        it("should not be able to click the deposit when the form is invalid", async () => {
            const app = applications[0];
            const token = tokens[0];
            const writeContract = vi.fn();

            useWriteContractMock.mockReturnValue({
                writeContract: writeContract,
            });

            render(
                <Component
                    {...defaultProps}
                    applications={[app]}
                    tokens={[token]}
                />,
            );

            await fillFormValues(app, token, "2");

            expect(
                screen.getByText("Deposit").closest("button"),
            ).not.toBeDisabled();

            await fillFormValues(app, token, " ");

            expect(screen.getByText("Invalid amount")).toBeVisible();
            expect(
                screen.getByText("Deposit").closest("button"),
            ).toBeDisabled();
            fireEvent.click(screen.getByText("Deposit"));
            expect(writeContract).not.toHaveBeenCalled();

            await fillFormValues(app, token, "2");
            expect(
                screen.getByText("Deposit").closest("button"),
            ).not.toBeDisabled();

            await fillFormValues(app, " ", "2");

            expect(screen.getByText("Invalid ERC20 address")).toBeVisible();

            expect(
                screen.getByText("Deposit").closest("button"),
            ).toBeDisabled();
            fireEvent.click(screen.getByText("Deposit"));
            expect(writeContract).not.toHaveBeenCalled();
        });

        it("should not be able to click the deposit when amount is above the allowance", async () => {
            const app = applications[0];
            const token = tokens[0];
            const writeContract = vi.fn();

            useWriteContractMock.mockReturnValue({
                writeContract: writeContract,
            });

            render(
                <Component
                    {...defaultProps}
                    applications={[app]}
                    tokens={[token]}
                />,
            );

            await fillFormValues(app, token, "10");

            fireEvent.click(screen.getByText("Deposit"));

            expect(writeContract).not.toHaveBeenCalled();
        });

        it("should be able to click the deposit button after fill everything and amount below allowance", async () => {
            const app = applications[0];
            const token = tokens[0];
            const writeContract = vi.fn();

            useWriteContractMock.mockReturnValue({
                writeContract: writeContract,
            });

            render(
                <Component
                    {...defaultProps}
                    applications={[app]}
                    tokens={[token]}
                />,
            );

            await fillFormValues(app, token, "2");

            await waitFor(() =>
                expect(
                    screen.getByText("Deposit").closest("button"),
                ).not.toBeDisabled(),
            );

            fireEvent.click(screen.getByText("Deposit"));

            expect(writeContract).toHaveBeenCalledTimes(1);
        });
    });

    describe("Transaction feedbacks", () => {
        beforeEach(() => {
            useReadContractsMock.mockReturnValue({
                isLoading: false,
                isSuccess: true,
                data: [
                    // decimals
                    {
                        result: 18,
                        error: undefined,
                    },
                    //symbol
                    {
                        result: "SIM20",
                        error: undefined,
                    },
                    // allowance
                    {
                        result: 0n,
                        error: undefined,
                    },
                    // balance
                    {
                        result: 1000000000000000000000n,
                        error: undefined,
                    },
                ],
            });
        });

        it("should ask the user to check the wallet when approving allowances", async () => {
            const app = applications[0];
            const token = tokens[0];

            useWriteErc20ApproveMock.mockReturnValue({
                ...cast(defaultReturnForWriteFn, useWriteErc20ApproveMock),
                status: "pending",
                isPending: true,
            });

            useWaitForTransactionReceiptMock.mockReturnValue({
                fetchStatus: "idle",
                isLoading: false,
                data: undefined,
            });

            render(
                <Component
                    {...defaultProps}
                    applications={[app]}
                    tokens={[token]}
                />,
            );

            await fillFormValues(app, token, "2");

            expect(
                screen.getByText("Approve").closest("button"),
            ).toBeDisabled(),
                expect(
                    screen.getByText("Deposit").closest("button"),
                ).toBeDisabled();

            expect(screen.getByText("Check wallet...")).toBeVisible();
        });

        it("should show a message while awaiting approval confirmation", async () => {
            const app = applications[0];
            const token = tokens[0];

            useWriteErc20ApproveMock.mockReturnValue({
                ...cast(defaultReturnForWriteFn, useWriteErc20ApproveMock),
                status: "idle",
                isPending: false,
                data: "0x001",
            });

            useWaitForTransactionReceiptMock.mockImplementation(
                (parameters) => {
                    return parameters?.hash === "0x001"
                        ? {
                              fetchStatus: "fetching",
                              isLoading: true,
                              data: undefined,
                          }
                        : {
                              data: undefined,
                              status: "pending",
                              isLoading: false,
                          };
                },
            );

            render(
                <Component
                    {...defaultProps}
                    applications={[app]}
                    tokens={[token]}
                />,
            );

            await fillFormValues(app, token, "2");

            await waitFor(() =>
                expect(
                    screen.getByText("Waiting for confirmation..."),
                ).toBeVisible(),
            );
        });

        it("should ask the user to check the wallet after start the deposit transaction", async () => {
            const app = applications[0];
            const token = tokens[0];

            useReadContractsMock.mockReturnValue({
                isLoading: false,
                isSuccess: true,
                data: [
                    // decimals
                    {
                        result: 18,
                        error: undefined,
                    },
                    //symbol
                    {
                        result: "SIM20",
                        error: undefined,
                    },
                    // allowance
                    {
                        result: 3000000000000000000n,
                        error: undefined,
                    },
                    // balance
                    {
                        result: 1000000000000000000000n,
                        error: undefined,
                    },
                ],
            });

            useWriteContractMock.mockReturnValue({
                ...cast(defaultReturnForWriteFn, useWriteContractMock),
                status: "pending",
                isPending: true,
            });

            useWaitForTransactionReceiptMock.mockReturnValue({
                fetchStatus: "idle",
                isLoading: false,
                data: undefined,
            });

            render(
                <Component
                    {...defaultProps}
                    applications={[app]}
                    tokens={[token]}
                />,
            );

            await fillFormValues(app, token, "2");

            expect(
                screen.getByText("Approve").closest("button"),
            ).toBeDisabled();

            expect(
                screen.getByText("Deposit").closest("button"),
            ).toBeDisabled();

            expect(screen.getByText("Check wallet...")).toBeVisible();
        });

        it("should show a message while awaiting deposit confirmation", async () => {
            const app = applications[0];
            const token = tokens[0];

            useReadContractsMock.mockReturnValue({
                isLoading: false,
                isSuccess: true,
                data: [
                    // decimals
                    {
                        result: 18,
                        error: undefined,
                    },
                    //symbol
                    {
                        result: "SIM20",
                        error: undefined,
                    },
                    // allowance
                    {
                        result: 3000000000000000000n,
                        error: undefined,
                    },
                    // balance
                    {
                        result: 1000000000000000000000n,
                        error: undefined,
                    },
                ],
            });

            useWriteContractMock.mockReturnValue({
                ...cast(defaultReturnForWriteFn, useWriteContractMock),
                status: "idle",
                isPending: false,
                data: "0x002",
            });

            useWaitForTransactionReceiptMock.mockImplementation(
                (parameters) => {
                    return parameters?.hash === "0x002"
                        ? {
                              fetchStatus: "fetching",
                              isLoading: true,
                              data: undefined,
                          }
                        : {
                              data: undefined,
                              status: "pending",
                              isLoading: false,
                          };
                },
            );

            render(
                <Component
                    {...defaultProps}
                    applications={[app]}
                    tokens={[token]}
                />,
            );

            await fillFormValues(app, token, "1");

            await waitFor(() =>
                expect(
                    screen.getByText("Waiting for confirmation..."),
                ).toBeVisible(),
            );
        });
    });

    describe("When deposit successed", () => {
        beforeEach(() => {
            useReadContractsMock.mockReturnValue({
                isLoading: false,
                isSuccess: true,
                data: [
                    // decimals
                    {
                        result: 18,
                        error: undefined,
                    },
                    //symbol
                    {
                        result: "SIM20",
                        error: undefined,
                    },
                    // allowance
                    {
                        result: 3000000000000000000n,
                        error: undefined,
                    },
                    // balance
                    {
                        result: 1000000000000000000000n,
                        error: undefined,
                    },
                ],
            });
        });

        it("should reset the form to initial state after the deposit is successful", async () => {
            const app = applications[0];
            const token = tokens[0];
            const onTokenSearchMock = vi.fn();
            const onSearchApplicationsMock = vi.fn();
            const onSuccessMock = vi.fn();

            useWriteContractMock.mockReturnValue({
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

            const { rerender } = render(
                <Component
                    {...defaultProps}
                    tokens={[token]}
                    applications={[app]}
                    onSearchApplications={onSearchApplicationsMock}
                    onSuccess={onSuccessMock}
                    onSearchTokens={onTokenSearchMock}
                />,
            );

            await fillFormValues(app, token, "2");

            expect(onSearchApplicationsMock).toHaveBeenCalledWith("");
            expect(onTokenSearchMock).toHaveBeenCalledWith("");
            expect(onSuccessMock).toHaveBeenCalledWith({
                receipt: { transactionHash: "0x01" },
                type: "ERC-20",
            });

            rerender(
                <Component
                    {...defaultProps}
                    applications={applications}
                    tokens={tokens}
                    onSearchApplications={onSearchApplicationsMock}
                    onSearchTokens={onTokenSearchMock}
                    onSuccess={onSuccessMock}
                />,
            );

            await waitFor(() =>
                expect(screen.queryByText("ERC-20")).not.toBeInTheDocument(),
            );

            expect(screen.queryByText("Amount")).not.toBeInTheDocument();
            expect(screen.queryByText("Advanced")).not.toBeInTheDocument();
            expect(screen.queryByText("Approve")).not.toBeInTheDocument();
            expect(screen.queryByText("Deposit")).not.toBeInTheDocument();
        });
    });
});
