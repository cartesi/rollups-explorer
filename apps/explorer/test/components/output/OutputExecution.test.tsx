import type { EpochStatus } from "@cartesi/client";
import { type Hex } from "viem";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { foundry, mainnet } from "wagmi/chains";
import OutputExecution from "../../../src/components/output/OutputExecution";
import type { VoucherOutput } from "../../../src/components/output/types";
import { content } from "../../../src/content";
import { shortenHash } from "../../../src/lib/textUtils";
import { fireEvent, render, screen, waitFor } from "../../test-utils";

const mocks = vi.hoisted(() => ({
    useEpoch: vi.fn(),
    useReadIApplicationWasOutputExecuted: vi.fn(),
    useSimulateIApplicationExecuteOutput: vi.fn(),
    useWriteIApplicationExecuteOutput: vi.fn(),
    useConfig: vi.fn(),
    useAccount: vi.fn(),
    useWaitForTransactionReceipt: vi.fn(),
    useChainModal: vi.fn(),
    useConnectModal: vi.fn(),
    useQueryClient: vi.fn(),
}));

vi.mock("@cartesi/react", () => ({
    useEpoch: mocks.useEpoch,
    useReadIApplicationWasOutputExecuted:
        mocks.useReadIApplicationWasOutputExecuted,
    useSimulateIApplicationExecuteOutput:
        mocks.useSimulateIApplicationExecuteOutput,
    useWriteIApplicationExecuteOutput: mocks.useWriteIApplicationExecuteOutput,
    useConfig: mocks.useConfig,
}));

vi.mock("wagmi", () => ({
    useAccount: mocks.useAccount,
    useConfig: mocks.useConfig,
    useWaitForTransactionReceipt: mocks.useWaitForTransactionReceipt,
}));

vi.mock("@rainbow-me/rainbowkit", () => ({
    useConnectModal: mocks.useConnectModal,
    useChainModal: mocks.useChainModal,
}));

vi.mock("@tanstack/react-query", () => ({
    useQueryClient: mocks.useQueryClient,
}));

const APPLICATION = "0x1234567890abcdef1234567890abcdef12345678" as const;
const TX_HASH =
    "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef" as const;

const buildOutput = (overrides: Partial<VoucherOutput> = {}): VoucherOutput =>
    ({
        epochIndex: 2n,
        inputIndex: 7n,
        index: 14n,
        rawData: "0x",
        decodedData: {
            type: "Voucher",
            payload: "0x",
            destination: "0x4A679253410272dd5232B3Ff7cF5dbB88f295319",
            value: 0n,
        },
        hash: null,
        outputHashesSiblings: [
            "0x5a26e5a8c5b393796bb8ea278408a7278afee9a52a16a55f65839fe7a4689551",
        ],
        executionTransactionHash: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    }) as VoucherOutput;

type SetupOptions = {
    epochStatus?: EpochStatus;
    wasOutputExecuted?: boolean | undefined;
    checkingOutputExecuted?: boolean;
    checkingOutputExecutedError?: Error | null;
    simulateIsFetching?: boolean;
    simulateError?: Error | null;
    simulateData?: { request: unknown } | undefined;
    isConnected?: boolean;
    chain?: { id: number } | null;
    waitIsSuccess?: boolean;
    waitData?: unknown;
    waitIsFetching?: boolean;
    executeTxHash?: Hex | undefined;
    executeIsPending?: boolean;
};

const setupMocks = ({
    epochStatus,
    wasOutputExecuted = false,
    checkingOutputExecuted = false,
    checkingOutputExecutedError = null,
    simulateIsFetching = false,
    simulateError = null,
    simulateData = undefined,
    isConnected = true,
    chain = mainnet,
    waitIsSuccess = false,
    waitData = undefined,
    waitIsFetching = false,
    executeTxHash = undefined,
    executeIsPending = false,
}: SetupOptions = {}) => {
    const refetch = vi.fn();
    const reset = vi.fn();
    const writeContract = vi.fn();
    const openConnectModal = vi.fn();
    const openChainModal = vi.fn();
    const invalidateQueries = vi.fn();

    mocks.useEpoch.mockReturnValue({
        data: epochStatus !== undefined ? { status: epochStatus } : undefined,
    });
    mocks.useReadIApplicationWasOutputExecuted.mockReturnValue({
        data: wasOutputExecuted,
        isFetching: checkingOutputExecuted,
        error: checkingOutputExecutedError,
        refetch,
    });
    mocks.useSimulateIApplicationExecuteOutput.mockReturnValue({
        data: simulateData,
        error: simulateError,
        isFetching: simulateIsFetching,
    });
    mocks.useWriteIApplicationExecuteOutput.mockReturnValue({
        data: executeTxHash,
        isPending: executeIsPending,
        reset,
        writeContract,
    });
    mocks.useAccount.mockReturnValue({ isConnected, chain });
    mocks.useConfig.mockReturnValue({ chains: chain ? [chain] : [] });
    mocks.useWaitForTransactionReceipt.mockReturnValue({
        data: waitData,
        isFetching: waitIsFetching,
        isSuccess: waitIsSuccess,
    });
    mocks.useConnectModal.mockReturnValue({ openConnectModal });
    mocks.useChainModal.mockReturnValue({ openChainModal });
    mocks.useQueryClient.mockReturnValue({ invalidateQueries });

    return {
        refetch,
        reset,
        writeContract,
        openConnectModal,
        openChainModal,
        invalidateQueries,
    };
};

describe("OutputExecution", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("feedback badge", () => {
        it("shows no badge when epoch status is undefined", () => {
            setupMocks({ epochStatus: undefined });
            render(
                <OutputExecution
                    output={buildOutput()}
                    application={APPLICATION}
                />,
            );

            expect(
                screen.queryByText(content.output.epoch.waitingClaim),
            ).not.toBeInTheDocument();
            expect(
                screen.queryByText(content.output.epoch.executionForeclosed),
            ).not.toBeInTheDocument();
        });

        it("shows no badge when epoch status is CLAIM_ACCEPTED", () => {
            setupMocks({ epochStatus: "CLAIM_ACCEPTED" });
            render(
                <OutputExecution
                    output={buildOutput()}
                    application={APPLICATION}
                />,
            );

            expect(
                screen.queryByText(content.output.epoch.waitingClaim),
            ).not.toBeInTheDocument();
            expect(
                screen.queryByText(content.output.epoch.executionForeclosed),
            ).not.toBeInTheDocument();
        });

        it("shows waiting claim badge for non-accepted epoch statuses", () => {
            setupMocks({ epochStatus: "OPEN" });
            render(
                <OutputExecution
                    output={buildOutput()}
                    application={APPLICATION}
                />,
            );

            expect(
                screen.getByText(content.output.epoch.waitingClaim),
            ).toBeVisible();
        });

        it("shows foreclosed badge when epoch status is CLAIM_FORECLOSED", () => {
            setupMocks({ epochStatus: "CLAIM_FORECLOSED" });
            render(
                <OutputExecution
                    output={buildOutput()}
                    application={APPLICATION}
                />,
            );

            expect(
                screen.getByText(content.output.epoch.executionForeclosed),
            ).toBeVisible();
        });
    });

    describe("Execute button labels", () => {
        it('displays "Execute" when claim is accepted and output is pending execution', () => {
            setupMocks({
                epochStatus: "CLAIM_ACCEPTED",
                wasOutputExecuted: false,
            });
            render(
                <OutputExecution
                    output={buildOutput()}
                    application={APPLICATION}
                />,
            );

            expect(
                screen.getByText(content.output.voucher.execute),
            ).toBeVisible();
        });

        it('displays "Checking voucher..." while verifying on-chain execution status', () => {
            setupMocks({
                epochStatus: "CLAIM_ACCEPTED",
                checkingOutputExecuted: true,
            });

            render(
                <OutputExecution
                    output={buildOutput()}
                    application={APPLICATION}
                />,
            );

            expect(
                screen.getByText(content.output.voucher.checking),
            ).toBeVisible();
        });

        it('displays "Preparing voucher..." while simulation is in progress', () => {
            setupMocks({
                epochStatus: "CLAIM_ACCEPTED",
                wasOutputExecuted: false,
                simulateIsFetching: true,
            });
            render(
                <OutputExecution
                    output={buildOutput()}
                    application={APPLICATION}
                />,
            );

            expect(
                screen.getByText(content.output.voucher.preparing),
            ).toBeVisible();
        });

        it('displays "Executed" when the output was already executed on-chain', () => {
            setupMocks({
                epochStatus: "CLAIM_ACCEPTED",
                wasOutputExecuted: true,
            });
            render(
                <OutputExecution
                    output={buildOutput()}
                    application={APPLICATION}
                />,
            );

            expect(
                screen.getByText(content.output.voucher.executed),
            ).toBeVisible();
        });

        it('displays "Executed" when the output has an execution transaction hash', () => {
            setupMocks({ epochStatus: "CLAIM_ACCEPTED" });
            render(
                <OutputExecution
                    output={buildOutput({ executionTransactionHash: TX_HASH })}
                    application={APPLICATION}
                />,
            );

            expect(
                screen.getByText(content.output.voucher.executed),
            ).toBeVisible();
        });
    });

    describe("execute button disabled state", () => {
        it("is disabled when the output is already executed on-chain", () => {
            setupMocks({
                epochStatus: "CLAIM_ACCEPTED",
                wasOutputExecuted: true,
            });
            render(
                <OutputExecution
                    output={buildOutput()}
                    application={APPLICATION}
                />,
            );

            expect(
                screen.getByRole("button", {
                    name: content.output.voucher.executed,
                }),
            ).toBeDisabled();
        });

        it("is disabled when there are wagmi errors", () => {
            setupMocks({
                epochStatus: "CLAIM_ACCEPTED",
                wasOutputExecuted: false,
                simulateError: Object.assign(new Error("Simulate failed"), {
                    shortMessage: "Simulate failed",
                }),
            });
            render(
                <OutputExecution
                    output={buildOutput()}
                    application={APPLICATION}
                />,
            );

            expect(
                screen.getByRole("button", {
                    name: content.output.voucher.execute,
                }),
            ).toBeDisabled();
        });

        it("is disabled while simulation is fetching", () => {
            setupMocks({
                epochStatus: "CLAIM_ACCEPTED",
                wasOutputExecuted: false,
                simulateIsFetching: true,
            });
            render(
                <OutputExecution
                    output={buildOutput()}
                    application={APPLICATION}
                />,
            );

            expect(
                screen.getByRole("button", {
                    name: content.output.voucher.preparing,
                }),
            ).toBeDisabled();
        });
    });

    describe("execute button click", () => {
        it("opens the connect modal when clicked by a disconnected user", () => {
            const { openConnectModal } = setupMocks({
                epochStatus: "CLAIM_ACCEPTED",
                isConnected: false,
                wasOutputExecuted: false,
            });
            render(
                <OutputExecution
                    output={buildOutput()}
                    application={APPLICATION}
                />,
            );

            fireEvent.click(
                screen.getByRole("button", {
                    name: content.output.voucher.execute,
                }),
            );

            expect(openConnectModal).toHaveBeenCalledTimes(1);
        });

        it("opens the chain modal when the connected user needs to switch networks", () => {
            const { openChainModal } = setupMocks({
                epochStatus: "CLAIM_ACCEPTED",
                isConnected: true,
                chain: null,
                wasOutputExecuted: false,
            });
            render(
                <OutputExecution
                    output={buildOutput()}
                    application={APPLICATION}
                />,
            );

            fireEvent.click(
                screen.getByRole("button", {
                    name: content.output.voucher.execute,
                }),
            );

            expect(openChainModal).toHaveBeenCalledTimes(1);
        });

        it("calls writeContract when user is connected and simulation data is available", () => {
            const request = { address: APPLICATION, data: "0x" as Hex };
            const { writeContract } = setupMocks({
                epochStatus: "CLAIM_ACCEPTED",
                isConnected: true,
                chain: mainnet,
                wasOutputExecuted: false,
                simulateData: { request },
            });
            render(
                <OutputExecution
                    output={buildOutput()}
                    application={APPLICATION}
                />,
            );

            fireEvent.click(
                screen.getByRole("button", {
                    name: content.output.voucher.execute,
                }),
            );

            expect(writeContract).toHaveBeenCalledWith(request);
        });
    });

    describe("execution transaction hash", () => {
        it("displays the transaction hash when the output was executed via L2 (as text for devnet)", () => {
            setupMocks({ epochStatus: "CLAIM_ACCEPTED", chain: foundry });
            render(
                <OutputExecution
                    output={buildOutput({ executionTransactionHash: TX_HASH })}
                    application={APPLICATION}
                />,
            );

            const txHashElement = screen.getByText(shortenHash(TX_HASH));
            expect(txHashElement).toBeVisible();
            expect(txHashElement.closest("a")).toBeNull();
        });

        it("displays the transaction hash when the output was executed via L2 (as anchor for mainnet/testnet)", () => {
            setupMocks({ epochStatus: "CLAIM_ACCEPTED", chain: mainnet });
            render(
                <OutputExecution
                    output={buildOutput({ executionTransactionHash: TX_HASH })}
                    application={APPLICATION}
                />,
            );

            const txHashElement = screen.getByText(shortenHash(TX_HASH));
            expect(txHashElement).toBeVisible();
            expect(txHashElement.closest("a")).toHaveAttribute(
                "href",
                `https://etherscan.io/tx/${TX_HASH}`,
            );
        });

        it("does not display a transaction hash when executionTransactionHash is null", () => {
            setupMocks({ epochStatus: "CLAIM_ACCEPTED" });
            render(
                <OutputExecution
                    output={buildOutput()}
                    application={APPLICATION}
                />,
            );

            expect(
                screen.queryByText(shortenHash(TX_HASH)),
            ).not.toBeInTheDocument();
        });
    });

    describe("error display", () => {
        it("shows an alert when the simulation step fails", () => {
            const errorMessage = "User rejected the request.";
            setupMocks({
                epochStatus: "CLAIM_ACCEPTED",
                wasOutputExecuted: false,
                simulateError: Object.assign(new Error(errorMessage), {
                    shortMessage: errorMessage,
                }),
            });
            render(
                <OutputExecution
                    output={buildOutput()}
                    application={APPLICATION}
                />,
            );

            expect(screen.getByText(errorMessage)).toBeVisible();
        });

        it("shows an alert when the on-chain execution check fails", () => {
            const errorMessage = "Failed to read contract.";
            setupMocks({
                epochStatus: "CLAIM_ACCEPTED",
                checkingOutputExecutedError: Object.assign(
                    new Error(errorMessage),
                    { shortMessage: errorMessage },
                ),
            });
            render(
                <OutputExecution
                    output={buildOutput()}
                    application={APPLICATION}
                />,
            );

            expect(screen.getByText(errorMessage)).toBeVisible();
        });
    });

    describe("onError callback", () => {
        it("is invoked with the list of errors when errors are present", () => {
            const onError = vi.fn();
            const errorMessage = "Contract simulation failed.";
            setupMocks({
                epochStatus: "CLAIM_ACCEPTED",
                wasOutputExecuted: false,
                simulateError: Object.assign(new Error(errorMessage), {
                    shortMessage: errorMessage,
                }),
            });
            render(
                <OutputExecution
                    output={buildOutput()}
                    application={APPLICATION}
                    onError={onError}
                />,
            );

            expect(onError).toHaveBeenCalledTimes(1);
            expect(onError.mock.calls[0][0]).toHaveLength(1);
        });

        it("is not invoked when there are no errors", () => {
            const onError = vi.fn();
            setupMocks({
                epochStatus: "CLAIM_ACCEPTED",
                wasOutputExecuted: false,
            });
            render(
                <OutputExecution
                    output={buildOutput()}
                    application={APPLICATION}
                    onError={onError}
                />,
            );

            expect(onError).not.toHaveBeenCalled();
        });
    });

    describe("onSuccess callback", () => {
        it("is invoked with the transaction receipt after successful execution", async () => {
            const onSuccess = vi.fn();
            const txReceipt = { transactionHash: TX_HASH };
            setupMocks({
                epochStatus: "CLAIM_ACCEPTED",
                wasOutputExecuted: false,
                waitIsSuccess: true,
                waitData: txReceipt,
            });
            render(
                <OutputExecution
                    output={buildOutput()}
                    application={APPLICATION}
                    onSuccess={onSuccess}
                />,
            );

            await waitFor(() =>
                expect(onSuccess).toHaveBeenCalledWith(txReceipt),
            );
        });

        it("invalidates the outputs query after successful execution", async () => {
            const { invalidateQueries } = setupMocks({
                epochStatus: "CLAIM_ACCEPTED",
                wasOutputExecuted: false,
                waitIsSuccess: true,
                waitData: { transactionHash: TX_HASH },
            });
            render(
                <OutputExecution
                    output={buildOutput()}
                    application={APPLICATION}
                />,
            );

            await waitFor(() =>
                expect(invalidateQueries).toHaveBeenCalledWith(
                    expect.objectContaining({ queryKey: ["outputs"] }),
                ),
            );
        });
    });
});
