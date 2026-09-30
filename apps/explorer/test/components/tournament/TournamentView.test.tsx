import { foundry } from "viem/chains";
import { describe, expect, it, vi } from "vitest";
import { TournamentView } from "../../../src/components/tournament/TournamentView";
import {
    createCommitment,
    createJoinBond,
    createMatch,
    createTournament,
} from "../../../src/stories/prt";
import { render, screen } from "../../test-utils";

vi.mock("next/navigation", () => ({
    usePathname: () => "/tournament",
    useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("wagmi", async () => {
    const actual = await vi.importActual("wagmi");
    return { ...actual, useConfig: () => ({ chains: [foundry] }) };
});

vi.mock("../../../src/components/tournament/InnerTournamentAction", () => ({
    InnerTournamentAction: () => (
        <button type="button">Propagate win to parent</button>
    ),
}));

vi.mock("../../../src/components/bond/BondRecoveryAction", () => ({
    BondRecoveryAction: () => <button type="button">Recover bond</button>,
}));

describe("TournamentView", () => {
    it("should show the details and titled sections", () => {
        render(
            <TournamentView
                commitments={[]}
                matches={[]}
                tournament={createTournament()}
            />,
        );

        expect(screen.getByText("Level")).toBeInTheDocument();
        expect(screen.getByText("Standing")).toBeInTheDocument();
        expect(screen.getByText("Matches")).toBeInTheDocument();
        expect(screen.getByText("Bond events")).toBeInTheDocument();
    });

    it("should leave out the bond section while the tournament runs", () => {
        render(
            <TournamentView
                commitments={[]}
                matches={[]}
                tournament={createTournament()}
            />,
        );

        expect(screen.queryByText("Bond")).not.toBeInTheDocument();
    });

    it("should show the bond section once the bond can be recovered", () => {
        render(
            <TournamentView
                commitments={[]}
                matches={[]}
                tournament={createTournament({
                    snapshot: {
                        standing: "ROOT_WINNER",
                        bondRecovery: {
                            disposition: "RECOVERABLE",
                            claimer:
                                "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                            payment: 250_000_000_000_000_000n,
                        },
                    },
                })}
            />,
        );

        expect(screen.getByText("Bond")).toBeInTheDocument();
        expect(screen.getByText("recoverable")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Recover bond" }),
        ).toBeInTheDocument();
    });

    it("should show only the bond pool while the tournament runs", () => {
        const commitment = createCommitment();
        render(
            <TournamentView
                bondPool={{
                    balance: 20_000_000_000_000_000n,
                    bondValue: 21_000_000_000_000_000n,
                    bonds: [createJoinBond(commitment)],
                }}
                commitments={[commitment]}
                matches={[]}
                tournament={createTournament()}
            />,
        );

        expect(screen.getByText("Bond")).toBeInTheDocument();
        expect(screen.getByText("Deposited")).toBeInTheDocument();
        expect(screen.getByText("0.02 ETH")).toBeInTheDocument();
        expect(screen.queryByText("Status")).not.toBeInTheDocument();
    });

    it("should offer settling the parent match of a finished inner tournament", () => {
        const parentMatch = createMatch();
        const inner = createTournament({
            level: 1n,
            parentTournamentAddress:
                "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
            parentMatchIdHash: parentMatch.idHash,
            snapshot: {
                standing: "INNER_WINNER",
                winnerExpiresAt: 180n,
                innerResult: {
                    disposition: "WINNER",
                    parentCommitment: parentMatch.commitmentOne,
                    pausedAllowance: 500n,
                },
            },
        });

        const { rerender } = render(
            <TournamentView
                commitments={[]}
                matches={[]}
                parent={{ match: parentMatch }}
                tournament={inner}
            />,
        );

        expect(screen.getByText("Parent match")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Propagate win to parent" }),
        ).toBeInTheDocument();

        rerender(
            <TournamentView
                commitments={[]}
                matches={[]}
                parent={{
                    match: {
                        ...parentMatch,
                        deletionReason: "CHILD_TOURNAMENT",
                    },
                }}
                tournament={inner}
            />,
        );

        expect(screen.queryByText("Parent match")).not.toBeInTheDocument();
    });
});
