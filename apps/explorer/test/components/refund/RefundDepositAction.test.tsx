import { iApplicationAbi } from "@cartesi/client/abi";
import {
    BaseError,
    ContractFunctionExecutionError,
    ContractFunctionRevertedError,
    encodeErrorResult,
    UserRejectedRequestError,
} from "viem";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { foundry } from "wagmi/chains";
import { RefundDepositAction } from "../../../src/components/refund/RefundDepositAction";
import { createDepositInput, depositor } from "../../../src/stories/deposits";
import { fireEvent, render, screen } from "../../test-utils";

const mocks = vi.hoisted(() => ({
    useAccount: vi.fn(),
    useWaitForTransactionReceipt: vi.fn(),
    useConnectModal: vi.fn(),
    useChainModal: vi.fn(),
    useSimulate: vi.fn(),
    useWrite: vi.fn(),
    useRefundStatus: vi.fn(),
    useRefundAsset: vi.fn(),
    useSelectedNodeConnection: vi.fn(),
    openConnectModal: vi.fn(),
    openChainModal: vi.fn(),
    writeContract: vi.fn(),
    reset: vi.fn(),
    refetch: vi.fn(),
}));

vi.mock("wagmi", async () => {
    const actual = await vi.importActual("wagmi");
    return {
        ...actual,
        useAccount: mocks.useAccount,
        useWaitForTransactionReceipt: mocks.useWaitForTransactionReceipt,
        useConfig: () => ({ chains: [foundry] }),
    };
});

vi.mock("@rainbow-me/rainbowkit", () => ({
    useConnectModal: mocks.useConnectModal,
    useChainModal: mocks.useChainModal,
}));

vi.mock("@cartesi/react", async () => {
    const actual = await vi.importActual("@cartesi/react");
    return {
        ...actual,
        useSimulateIApplicationIssueRefund: mocks.useSimulate,
        useWriteIApplicationIssueRefund: mocks.useWrite,
    };
});

vi.mock("../../../src/components/refund/hooks/useRefundStatus", () => ({
    useRefundStatus: mocks.useRefundStatus,
}));

vi.mock("../../../src/components/refund/hooks/useRefundAssets", () => ({
    useRefundAsset: mocks.useRefundAsset,
}));

vi.mock("../../../src/components/connection/hooks", () => ({
    useSelectedNodeConnection: mocks.useSelectedNodeConnection,
}));

const application = "0x40a7C73a6a592D8697bE97254E273E6f3FB46000";
const input = createDepositInput({ index: 3n, epochIndex: 52n });
const request = { functionName: "issueRefund" };
const connected = { isConnected: true, chain: foundry };

const renderAction = (
    props: Partial<Parameters<typeof RefundDepositAction>[0]> = {},
) =>
    render(
        <RefundDepositAction
            application={application}
            input={input}
            epochStatus="CLAIM_FORECLOSED"
            {...props}
        />,
    );

const refundButton = () =>
    screen.queryByRole("button", { name: "Refund deposit" });

describe("RefundDepositAction", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.useAccount.mockReturnValue(connected);
        mocks.useConnectModal.mockReturnValue({
            openConnectModal: mocks.openConnectModal,
        });
        mocks.useChainModal.mockReturnValue({
            openChainModal: mocks.openChainModal,
        });
        mocks.useSimulate.mockReturnValue({
            data: { request },
            isFetching: false,
            error: null,
        });
        mocks.useWrite.mockReturnValue({
            writeContract: mocks.writeContract,
            reset: mocks.reset,
            data: undefined,
            isPending: false,
            error: null,
        });
        mocks.useWaitForTransactionReceipt.mockReturnValue({
            isLoading: false,
            isSuccess: false,
            error: null,
        });
        mocks.useRefundStatus.mockReturnValue({
            refundIssued: false,
            isLoading: false,
            error: null,
            refetch: mocks.refetch,
        });
        mocks.useRefundAsset.mockImplementation((asset) => asset);
        mocks.useSelectedNodeConnection.mockReturnValue({ type: "user" });
    });

    it("should describe the refund and send it when connected", () => {
        renderAction();

        expect(screen.getByText("Refund 1.5 ETH to")).toBeInTheDocument();
        fireEvent.click(refundButton()!);

        expect(mocks.useSimulate).toHaveBeenCalledWith(
            expect.objectContaining({
                address: application,
                args: [input.index, input.rawData],
                query: { enabled: true },
            }),
        );
        expect(mocks.writeContract).toHaveBeenCalledWith(request);
    });

    it("should ask to connect a wallet when disconnected", () => {
        mocks.useAccount.mockReturnValue({ isConnected: false });
        renderAction();

        fireEvent.click(refundButton()!);

        expect(mocks.openConnectModal).toHaveBeenCalledTimes(1);
        expect(mocks.writeContract).not.toHaveBeenCalled();
        expect(mocks.useSimulate).toHaveBeenCalledWith(
            expect.objectContaining({ query: { enabled: false } }),
        );
    });

    it("should render nothing for an input that is not a deposit", () => {
        const generic = createDepositInput();
        generic.decodedData!.sender = depositor;
        renderAction({ input: generic });

        expect(screen.queryByText(/Refund/)).not.toBeInTheDocument();
        expect(mocks.useRefundStatus).toHaveBeenCalledWith(
            application,
            generic.index,
            { enabled: false },
        );
    });

    it("should render nothing for an accepted epoch", () => {
        renderAction({ epochStatus: "CLAIM_ACCEPTED" });

        expect(screen.queryByText(/Refund/)).not.toBeInTheDocument();
    });

    it("should render nothing on the mock connection", () => {
        mocks.useSelectedNodeConnection.mockReturnValue({
            type: "system_mock",
        });
        renderAction();

        expect(screen.queryByText(/Refund/)).not.toBeInTheDocument();
    });

    it("should show the deposit as refunded when the chain says so", () => {
        mocks.useRefundStatus.mockReturnValue({
            refundIssued: true,
            isLoading: false,
            error: null,
            refetch: mocks.refetch,
        });
        renderAction();

        expect(screen.getByText("Deposit refunded")).toBeInTheDocument();
        expect(refundButton()).not.toBeInTheDocument();
        expect(mocks.useSimulate).toHaveBeenCalledWith(
            expect.objectContaining({ query: { enabled: false } }),
        );
    });

    it("should treat a RefundAlreadyIssued revert as refunded and refetch", () => {
        mocks.useSimulate.mockReturnValue({
            data: undefined,
            isFetching: false,
            error: new ContractFunctionExecutionError(
                new ContractFunctionRevertedError({
                    abi: iApplicationAbi,
                    data: encodeErrorResult({
                        abi: iApplicationAbi,
                        errorName: "RefundAlreadyIssued",
                        args: [input.index],
                    }),
                    functionName: "issueRefund",
                }),
                {
                    abi: iApplicationAbi,
                    functionName: "issueRefund",
                    args: [input.index, input.rawData],
                },
            ),
        });
        renderAction();

        expect(screen.getByText("Deposit refunded")).toBeInTheDocument();
        expect(mocks.refetch).toHaveBeenCalled();
    });

    it("should show plain copy when the write fails", () => {
        mocks.useWrite.mockReturnValue({
            writeContract: mocks.writeContract,
            reset: mocks.reset,
            data: undefined,
            isPending: false,
            error: new BaseError("execution reverted"),
        });
        renderAction();

        expect(
            screen.getByText("The refund could not be sent."),
        ).toBeInTheDocument();
        expect(refundButton()).toBeInTheDocument();
        expect(mocks.reset).not.toHaveBeenCalled();
    });

    it("should reset a wallet rejection back to the button", () => {
        mocks.useWrite.mockReturnValue({
            writeContract: mocks.writeContract,
            reset: mocks.reset,
            data: undefined,
            isPending: false,
            error: new UserRejectedRequestError(new Error("denied")),
        });
        renderAction();

        expect(mocks.reset).toHaveBeenCalledTimes(1);
    });

    it("should wait while the transaction is mined", () => {
        mocks.useWaitForTransactionReceipt.mockReturnValue({
            isLoading: true,
            isSuccess: false,
            error: null,
        });
        renderAction();

        expect(
            screen.getByText("Waiting for confirmation…"),
        ).toBeInTheDocument();
    });

    it("should report the confirmed refund once and refetch the status", () => {
        const onRefunded = vi.fn();
        mocks.useWaitForTransactionReceipt.mockReturnValue({
            isLoading: false,
            isSuccess: true,
            error: null,
        });

        const { rerender } = render(
            <RefundDepositAction
                application={application}
                input={input}
                onRefunded={onRefunded}
            />,
        );
        rerender(
            <RefundDepositAction
                application={application}
                input={input}
                onRefunded={() => onRefunded()}
            />,
        );

        expect(screen.getByText("Deposit refunded")).toBeInTheDocument();
        expect(onRefunded).toHaveBeenCalledTimes(1);
        expect(mocks.refetch).toHaveBeenCalledTimes(1);
    });
});
