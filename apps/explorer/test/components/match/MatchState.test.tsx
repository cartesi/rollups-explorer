import { keccak256, toHex, zeroAddress } from "viem";
import { describe, expect, it, vi } from "vitest";
import { MatchState } from "../../../src/components/match/MatchState";
import {
    createBisection,
    createCommitment,
    createJoinBond,
    createMatch,
    createMatchSnapshot,
    createTournament,
} from "../../../src/stories/prt";
import { render, screen } from "../../test-utils";

const mocks = vi.hoisted(() => ({ MatchTimeoutAction: vi.fn() }));

vi.mock("../../../src/components/match/MatchTimeoutAction", () => ({
    MatchTimeoutAction: (props: unknown) => {
        mocks.MatchTimeoutAction(props);
        return <button type="button">Claim win by timeout</button>;
    },
}));

const tournament = createTournament({ height: 48n, log2step: 44n });

const bisecting = createMatch({
    snapshot: createMatchSnapshot({
        asOfBlock: 1200n,
        timeoutOutcome: "ONE_WINS",
        phase: "BISECTING",
        bisection: {
            ...createBisection({
                responder: "TWO",
                segmentStartCycle: 5n << 68n,
            }),
            currentHeight: 4n,
        },
        sealed: null,
    }),
});

describe("MatchState", () => {
    it("should display the bisection frontier and the timeout outcome", () => {
        render(<MatchState match={bisecting} tournament={tournament} />);

        expect(screen.getByText("bisecting")).toBeInTheDocument();
        expect(screen.getByText("as of block 1200")).toBeInTheDocument();
        expect(screen.getByText("4 / 48")).toBeInTheDocument();
        expect(
            screen.getByText("Input #5 · mcycle 0 – 268,435,455"),
        ).toBeInTheDocument();
        expect(screen.getByText("268,435,456 mcycles")).toBeInTheDocument();
        expect(screen.getByText("Responder")).toBeInTheDocument();
        expect(
            screen.getByText("Commitment one can win by timeout"),
        ).toBeInTheDocument();
    });

    it("should explain the input slots of the segment", () => {
        render(<MatchState match={bisecting} tournament={tournament} />);

        expect(
            screen.getByLabelText(/An input slot within the epoch/),
        ).toBeInTheDocument();
    });

    it("should display the commitment clocks", () => {
        render(
            <MatchState
                match={bisecting}
                tournament={tournament}
                commitments={[
                    createCommitment({
                        commitment: bisecting.commitmentOne,
                        snapshot: { clockAllowance: 320n },
                    }),
                    createCommitment({
                        commitment: bisecting.commitmentTwo,
                        snapshot: {
                            asOfBlock: 1200n,
                            clockRunning: true,
                            clockDeadline: 1250n,
                        },
                    }),
                ]}
            />,
        );

        expect(screen.getByText("clock paused")).toBeInTheDocument();
        expect(screen.getByText("320 blocks of allowance")).toBeInTheDocument();
        expect(screen.getByText("clock running")).toBeInTheDocument();
        expect(
            screen.getByText("deadline at block 1250 (50 blocks left)"),
        ).toBeInTheDocument();
    });

    it("should flag a commitment without claimer as inactive", () => {
        render(
            <MatchState
                match={bisecting}
                tournament={tournament}
                commitments={[
                    createCommitment({ snapshot: { claimer: zeroAddress } }),
                ]}
            />,
        );

        expect(screen.getByText("inactive")).toBeInTheDocument();
    });

    it("should show a deleted match as closed without live details", () => {
        render(
            <MatchState
                match={createMatch({
                    deletionReason: "TIMEOUT",
                    winnerCommitment: "ONE",
                })}
                tournament={tournament}
                commitments={[createCommitment()]}
            />,
        );

        expect(screen.getByText("closed")).toBeInTheDocument();
        expect(
            screen.getByLabelText(
                "A closed match cannot change, so the node does not read it again. Its observation block can be older than the tournament's.",
            ),
        ).toBeInTheDocument();
        expect(screen.queryByText("Clocks")).not.toBeInTheDocument();
        expect(screen.queryByText("Responder")).not.toBeInTheDocument();
    });

    it("should offer the timeout call with the winner's root children", () => {
        const survivor = createCommitment({
            commitment: bisecting.commitmentOne,
            snapshot: { asOfBlock: 1200n, clockAllowance: 320n },
        });
        const children = [
            keccak256(toHex("left")),
            keccak256(toHex("right")),
        ] as const;
        render(
            <MatchState
                commitments={[survivor]}
                joinBonds={
                    new Map([
                        [
                            bisecting.commitmentOne,
                            createJoinBond(survivor, { children }),
                        ],
                    ])
                }
                match={{
                    ...bisecting,
                    snapshot: { ...bisecting.snapshot, deferredCharge: 20n },
                }}
                tournament={tournament}
            />,
        );

        expect(
            screen.getByRole("button", { name: "Claim win by timeout" }),
        ).toBeInTheDocument();
        expect(mocks.MatchTimeoutAction).toHaveBeenCalledWith(
            expect.objectContaining({
                winnerChildren: children,
                expiresIn: 300n,
                tournamentAddress: tournament.address,
            }),
        );
    });
});
