import { keccak256, toHex } from "viem";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { foundry } from "wagmi/chains";
import { InnerTournamentAction } from "../../../src/components/tournament/InnerTournamentAction";
import {
    createMatch,
    createMatchSnapshot,
    createTournament,
} from "../../../src/stories/prt";
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
    useSimulateITournamentWinInnerTournament: mocks.useSimulateWin,
    useSimulateITournamentEliminateInnerTournament: mocks.useSimulateEliminate,
    useWriteITournamentWinInnerTournament: mocks.useWrite,
    useWriteITournamentEliminateInnerTournament: mocks.useWrite,
}));

vi.mock("../../../src/components/connection/hooks", () => ({
    useSelectedNodeConnection: mocks.useSelectedNodeConnection,
}));

const parentTournamentAddress = "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86";
const children = [keccak256(toHex("left")), keccak256(toHex("right"))] as const;
const parentMatch = createMatch({
    snapshot: createMatchSnapshot({ phase: "UNINITIALIZED" }),
});
const child = (disposition: "WINNER" | "ELIMINABLE") =>
    createTournament({
        address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        level: 1n,
        parentTournamentAddress,
        parentMatchIdHash: parentMatch.idHash,
        snapshot: {
            asOfBlock: 100n,
            winnerExpiresAt: disposition === "WINNER" ? 180n : 0n,
            innerResult: {
                disposition,
                parentCommitment:
                    disposition === "WINNER" ? parentMatch.commitmentOne : null,
                pausedAllowance: 500n,
            },
        },
    });
const simulated = (functionName: string) => ({
    data: { request: { functionName } },
    isFetching: false,
    isError: false,
    error: null,
    status: "success",
});

describe("InnerTournamentAction", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.useAccount.mockReturnValue({ isConnected: true, chain: foundry });
        mocks.useSimulateWin.mockReturnValue(simulated("winInnerTournament"));
        mocks.useSimulateEliminate.mockReturnValue(
            simulated("eliminateInnerTournament"),
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

    it("should propagate the win on the parent tournament", () => {
        const tournament = child("WINNER");
        render(
            <InnerTournamentAction
                child={tournament}
                parentMatch={parentMatch}
                winnerChildren={children}
            />,
        );

        expect(mocks.useSimulateWin).toHaveBeenCalledWith(
            expect.objectContaining({
                address: parentTournamentAddress,
                args: [tournament.address, ...children],
            }),
        );
        expect(
            screen.getByText("Call will expire in 80 blocks"),
        ).toBeInTheDocument();

        fireEvent.click(
            screen.getByRole("button", { name: "Propagate win to parent" }),
        );
        expect(mocks.writeContract).toHaveBeenCalledWith({
            functionName: "winInnerTournament",
        });
    });

    it("should close the parent match of an eliminable inner tournament", () => {
        render(
            <InnerTournamentAction
                child={child("ELIMINABLE")}
                parentMatch={parentMatch}
            />,
        );

        fireEvent.click(
            screen.getByRole("button", { name: "Close parent match" }),
        );
        expect(mocks.writeContract).toHaveBeenCalledWith({
            functionName: "eliminateInnerTournament",
        });
    });

    it("should explain a win that needs children it cannot read", () => {
        render(
            <InnerTournamentAction
                child={child("WINNER")}
                parentMatch={parentMatch}
            />,
        );

        expect(
            screen.getByText("Win propagation not available here"),
        ).toBeInTheDocument();
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("should offer nothing once the parent match is closed", () => {
        render(
            <InnerTournamentAction
                child={child("ELIMINABLE")}
                parentMatch={{
                    ...parentMatch,
                    deletionReason: "CHILD_TOURNAMENT",
                }}
            />,
        );

        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("should not render for the mock connection", () => {
        mocks.useSelectedNodeConnection.mockReturnValue({
            type: "system_mock",
        });
        render(
            <InnerTournamentAction
                child={child("ELIMINABLE")}
                parentMatch={parentMatch}
            />,
        );

        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
});
