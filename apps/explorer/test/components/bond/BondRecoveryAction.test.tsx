import { beforeEach, describe, expect, it, vi } from "vitest";
import { foundry } from "wagmi/chains";
import { BondRecoveryAction } from "../../../src/components/bond/BondRecoveryAction";
import { fireEvent, render, screen } from "../../test-utils";

const mocks = vi.hoisted(() => ({
    useAccount: vi.fn(),
    useWaitForTransactionReceipt: vi.fn(),
    useConnectModal: vi.fn(),
    useChainModal: vi.fn(),
    useSimulate: vi.fn(),
    useWrite: vi.fn(),
    useSelectedNodeConnection: vi.fn(),
    openConnectModal: vi.fn(),
    openChainModal: vi.fn(),
    writeContract: vi.fn(),
}));

vi.mock("wagmi", () => ({
    useAccount: mocks.useAccount,
    useWaitForTransactionReceipt: mocks.useWaitForTransactionReceipt,
}));

vi.mock("@rainbow-me/rainbowkit", () => ({
    useConnectModal: mocks.useConnectModal,
    useChainModal: mocks.useChainModal,
}));

vi.mock("@cartesi/react", () => ({
    useSimulateITournamentTryRecoveringBond: mocks.useSimulate,
    useWriteITournamentTryRecoveringBond: mocks.useWrite,
}));

vi.mock("../../../src/components/connection/hooks", () => ({
    useSelectedNodeConnection: mocks.useSelectedNodeConnection,
}));

const tournamentAddress = "0xA2835312696Afa86c969e40831857dbB1412627f";
const request = { functionName: "tryRecoveringBond" };

const setup = (account: { isConnected: boolean; chain?: unknown }) => {
    mocks.useAccount.mockReturnValue(account);
    render(<BondRecoveryAction tournamentAddress={tournamentAddress} />);
    fireEvent.click(screen.getByRole("button", { name: "Recover bond" }));
};

describe("BondRecoveryAction", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.useConnectModal.mockReturnValue({
            openConnectModal: mocks.openConnectModal,
        });
        mocks.useChainModal.mockReturnValue({
            openChainModal: mocks.openChainModal,
        });
        mocks.useSimulate.mockReturnValue({
            data: { request },
            isFetching: false,
            isError: false,
            error: null,
            status: "success",
        });
        mocks.useWrite.mockReturnValue({
            writeContract: mocks.writeContract,
            isPending: false,
            isSuccess: false,
            isError: false,
            error: null,
            status: "idle",
        });
        mocks.useWaitForTransactionReceipt.mockReturnValue({
            isLoading: false,
            isSuccess: false,
            error: null,
            status: "idle",
        });
        mocks.useSelectedNodeConnection.mockReturnValue({ type: "user" });
    });

    it("should ask to connect a wallet when disconnected", () => {
        setup({ isConnected: false });

        expect(mocks.openConnectModal).toHaveBeenCalledTimes(1);
        expect(mocks.writeContract).not.toHaveBeenCalled();
    });

    it("should ask to switch network on an unknown chain", () => {
        setup({ isConnected: true, chain: undefined });

        expect(mocks.openChainModal).toHaveBeenCalledTimes(1);
        expect(mocks.writeContract).not.toHaveBeenCalled();
    });

    it("should send the recovery when connected", () => {
        setup({ isConnected: true, chain: foundry });

        expect(mocks.writeContract).toHaveBeenCalledWith(request);
    });

    it("should not render for the mock connection", () => {
        mocks.useSelectedNodeConnection.mockReturnValue({
            type: "system_mock",
        });
        mocks.useAccount.mockReturnValue({ isConnected: false });

        render(<BondRecoveryAction tournamentAddress={tournamentAddress} />);

        expect(
            screen.queryByRole("button", { name: "Recover bond" }),
        ).not.toBeInTheDocument();
    });

    it("should report the confirmed recovery once", () => {
        const onRecovered = vi.fn();
        mocks.useAccount.mockReturnValue({ isConnected: true, chain: foundry });
        mocks.useWaitForTransactionReceipt.mockReturnValue({
            isLoading: false,
            isSuccess: true,
            error: null,
            status: "success",
        });

        const { rerender } = render(
            <BondRecoveryAction
                tournamentAddress={tournamentAddress}
                onRecovered={onRecovered}
            />,
        );
        rerender(
            <BondRecoveryAction
                tournamentAddress={tournamentAddress}
                onRecovered={() => onRecovered()}
            />,
        );

        expect(onRecovered).toHaveBeenCalledTimes(1);
    });
});
