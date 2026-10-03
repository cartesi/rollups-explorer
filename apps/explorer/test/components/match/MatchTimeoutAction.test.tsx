import { keccak256, toHex } from "viem";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { foundry } from "wagmi/chains";
import { MatchTimeoutAction } from "../../../src/components/match/MatchTimeoutAction";
import { createMatch, createMatchSnapshot } from "../../../src/stories/prt";
import { fireEvent, render, screen } from "../../test-utils";

const mocks = vi.hoisted(() => ({
    useAccount: vi.fn(),
    useWaitForTransactionReceipt: vi.fn(),
    useSimulateWin: vi.fn(),
    useSimulateEliminate: vi.fn(),
    useWrite: vi.fn(),
    useSelectedNodeConnection: vi.fn(),
    openConnectModal: vi.fn(),
    writeContract: vi.fn(),
}));

vi.mock("wagmi", () => ({
    useAccount: mocks.useAccount,
    useWaitForTransactionReceipt: mocks.useWaitForTransactionReceipt,
}));

vi.mock("@rainbow-me/rainbowkit", () => ({
    useConnectModal: () => ({ openConnectModal: mocks.openConnectModal }),
    useChainModal: () => ({ openChainModal: vi.fn() }),
}));

vi.mock("@cartesi/react", () => ({
    useSimulateITournamentWinMatchByTimeout: mocks.useSimulateWin,
    useSimulateITournamentEliminateMatchByTimeout: mocks.useSimulateEliminate,
    useWriteITournamentWinMatchByTimeout: mocks.useWrite,
    useWriteITournamentEliminateMatchByTimeout: mocks.useWrite,
}));

vi.mock("../../../src/components/connection/hooks", () => ({
    useSelectedNodeConnection: mocks.useSelectedNodeConnection,
}));

const tournamentAddress = "0xA2835312696Afa86c969e40831857dbB1412627f";
const children = [keccak256(toHex("left")), keccak256(toHex("right"))] as const;
const simulated = (functionName: string) => ({
    data: { request: { functionName } },
    isFetching: false,
    isError: false,
    error: null,
    status: "success",
});
const withOutcome = (timeoutOutcome: "ONE_WINS" | "ELIMINATE_BOTH") =>
    createMatch({ snapshot: createMatchSnapshot({ timeoutOutcome }) });

describe("MatchTimeoutAction", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.useAccount.mockReturnValue({ isConnected: true, chain: foundry });
        mocks.useSimulateWin.mockReturnValue(simulated("winMatchByTimeout"));
        mocks.useSimulateEliminate.mockReturnValue(
            simulated("eliminateMatchByTimeout"),
        );
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
            status: "pending",
            fetchStatus: "idle",
        });
        mocks.useSelectedNodeConnection.mockReturnValue({ type: "user" });
    });

    it("should send the timeout win with the winner's root children", () => {
        const match = withOutcome("ONE_WINS");
        render(
            <MatchTimeoutAction
                match={match}
                tournamentAddress={tournamentAddress}
                winnerChildren={children}
                expiresIn={300n}
            />,
        );

        expect(mocks.useSimulateWin).toHaveBeenCalledWith(
            expect.objectContaining({
                args: [
                    {
                        commitmentOne: match.commitmentOne,
                        commitmentTwo: match.commitmentTwo,
                    },
                    ...children,
                ],
            }),
        );
        expect(
            screen.getByText("Call will expire in 300 blocks"),
        ).toBeInTheDocument();

        fireEvent.click(
            screen.getByRole("button", { name: "Claim win by timeout" }),
        );
        expect(mocks.writeContract).toHaveBeenCalledWith({
            functionName: "winMatchByTimeout",
        });
    });

    it("should send the elimination of both claims", () => {
        render(
            <MatchTimeoutAction
                match={withOutcome("ELIMINATE_BOTH")}
                tournamentAddress={tournamentAddress}
            />,
        );

        fireEvent.click(
            screen.getByRole("button", { name: "Eliminate both claims" }),
        );
        expect(mocks.writeContract).toHaveBeenCalledWith({
            functionName: "eliminateMatchByTimeout",
        });
    });

    it("should explain a win that needs children it cannot read", () => {
        render(
            <MatchTimeoutAction
                match={withOutcome("ONE_WINS")}
                tournamentAddress={tournamentAddress}
            />,
        );

        expect(
            screen.getByText("Timeout win not available here"),
        ).toBeInTheDocument();
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("should ask to connect a wallet before sending", () => {
        mocks.useAccount.mockReturnValue({ isConnected: false });
        render(
            <MatchTimeoutAction
                match={withOutcome("ELIMINATE_BOTH")}
                tournamentAddress={tournamentAddress}
            />,
        );

        fireEvent.click(
            screen.getByRole("button", { name: "Eliminate both claims" }),
        );
        expect(mocks.openConnectModal).toHaveBeenCalledTimes(1);
        expect(mocks.writeContract).not.toHaveBeenCalled();
    });

    it("should not render for the mock connection", () => {
        mocks.useSelectedNodeConnection.mockReturnValue({
            type: "system_mock",
        });
        render(
            <MatchTimeoutAction
                match={withOutcome("ELIMINATE_BOTH")}
                tournamentAddress={tournamentAddress}
            />,
        );

        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
});
