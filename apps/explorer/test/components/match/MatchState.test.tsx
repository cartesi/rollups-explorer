import { zeroAddress } from "viem";
import { describe, expect, it } from "vitest";
import { MatchState } from "../../../src/components/match/MatchState";
import {
    createBisection,
    createCommitment,
    createMatch,
    createMatchSnapshot,
    createTournament,
} from "../../../src/stories/prt";
import { render, screen } from "../../test-utils";

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
});
