import { keccak256, toHex, zeroAddress } from "viem";
import { describe, expect, it } from "vitest";
import {
    getAdvanceRanges,
    getAdvanceSide,
    getBlocksLeft,
    getLoser,
    getMatchProgress,
    getResponder,
    getTournamentCycleRange,
    getTournamentOutcome,
    getWinner,
    isTournamentSettled,
    toCycle,
} from "../../src/lib/prtUtils";
import {
    createBisection,
    createMatch,
    createMatchAdvanced,
    createMatchSnapshot,
    createTournament,
    createTournamentSnapshot,
} from "../../src/stories/prt";

const one = keccak256(toHex(1));
const two = keccak256(toHex(2));
const finalState = keccak256(toHex(3));

describe("prtUtils", () => {
    describe("getTournamentOutcome", () => {
        it("should return the root winner with its final state", () => {
            const outcome = getTournamentOutcome(
                createTournamentSnapshot({
                    standing: "ROOT_WINNER",
                    candidate: one,
                    winnerCommitment: one,
                    finalStateHash: finalState,
                }),
            );

            expect(outcome).toEqual({
                status: "winner",
                commitment: one,
                finalStateHash: finalState,
            });
        });

        it("should return an inner winner as provisional until it expires", () => {
            const outcome = getTournamentOutcome(
                createTournamentSnapshot({
                    standing: "INNER_WINNER",
                    candidate: one,
                    winnerCommitment: one,
                    winnerExpiresAt: 250n,
                }),
            );

            expect(outcome).toEqual({
                status: "provisional",
                commitment: one,
                finalStateHash: null,
                expiresAt: 250n,
            });
        });

        it("should keep an expired inner candidate out of the winners", () => {
            const outcome = getTournamentOutcome(
                createTournamentSnapshot({
                    standing: "INNER_ELIMINABLE_WINNER_EXPIRED",
                    candidate: one,
                }),
            );

            expect(outcome).toEqual({ status: "expired", candidate: one });
        });

        it.each(["ROOT_FAILED", "INNER_ELIMINABLE_NO_WINNER"] as const)(
            "should return no winner for %s",
            (standing) => {
                expect(
                    getTournamentOutcome(
                        createTournamentSnapshot({ standing }),
                    ),
                ).toEqual({ status: "noWinner" });
            },
        );

        it.each(["MATCHES_ACTIVE", "AWAITING_CLOSURE"] as const)(
            "should return pending with the candidate for %s",
            (standing) => {
                expect(
                    getTournamentOutcome(
                        createTournamentSnapshot({ standing, candidate: two }),
                    ),
                ).toEqual({ status: "pending", candidate: two });
            },
        );
    });

    describe("isTournamentSettled", () => {
        const settled = {
            standing: "ROOT_WINNER",
            finishedAtBlock: 90n,
            asOfBlock: 100n,
            bondRecovery: {
                disposition: "RECOVERED",
                claimer: null,
                payment: null,
            },
        } as const;

        it("should be settled once finished and the bond is recovered", () => {
            expect(
                isTournamentSettled(createTournament({ snapshot: settled })),
            ).toBe(true);
        });

        it("should not be settled while the bond is still recoverable", () => {
            const tournament = createTournament({
                snapshot: {
                    ...settled,
                    bondRecovery: {
                        disposition: "RECOVERABLE",
                        claimer: zeroAddress,
                        payment: 0n,
                    },
                },
            });

            expect(isTournamentSettled(tournament)).toBe(false);
        });

        it("should not be settled while an inner winner can expire", () => {
            const tournament = createTournament({
                snapshot: { ...settled, standing: "INNER_WINNER" },
            });

            expect(isTournamentSettled(tournament)).toBe(false);
        });

        it("should not be settled when finished after the snapshot block", () => {
            const tournament = createTournament({
                snapshot: { ...settled, finishedAtBlock: 101n },
            });

            expect(isTournamentSettled(tournament)).toBe(false);
        });
    });

    describe("cycles", () => {
        const tournament = createTournament({
            baseCycle: 1000n,
            log2step: 4n,
            height: 3n,
        });

        it("should map a leaf position to its cycle", () => {
            expect(toCycle(tournament, 2n)).toBe(1032n);
        });

        it("should span the whole commitment tree", () => {
            expect(getTournamentCycleRange(tournament)).toEqual([1000n, 1128n]);
        });

        it("should derive the advance ranges from the segment positions", () => {
            const advances = [
                createMatchAdvanced({ segmentStartPosition: 4n }),
                createMatchAdvanced({ segmentStartPosition: 4n }),
            ];

            expect(getAdvanceRanges(tournament, advances)).toEqual([
                [0n, 8n],
                [4n, 8n],
                [4n, 6n],
            ]);
        });
    });

    describe("getMatchProgress", () => {
        const tournament = createTournament({ height: 5n });

        it("should use the current height while bisecting", () => {
            const match = createMatch({
                snapshot: createMatchSnapshot({
                    phase: "BISECTING",
                    bisection: { ...createBisection(), currentHeight: 3n },
                    sealed: null,
                }),
            });

            expect(getMatchProgress(match, tournament, 0)).toBe(50);
        });

        it("should be complete once ready to seal", () => {
            const match = createMatch({
                snapshot: createMatchSnapshot({
                    phase: "READY_TO_SEAL",
                    bisection: { ...createBisection(), currentHeight: null },
                    sealed: null,
                }),
            });

            expect(getMatchProgress(match, tournament, 0)).toBe(100);
        });

        it("should count the advances of a deleted match", () => {
            const match = createMatch({ deletionReason: "TIMEOUT" });

            expect(getMatchProgress(match, tournament, 1)).toBe(25);
        });
    });

    describe("sides", () => {
        const match = createMatch({
            commitmentOne: one,
            commitmentTwo: two,
            winnerCommitment: "TWO",
        });

        it("should alternate the advancing side starting with one", () => {
            expect([0, 1, 2].map(getAdvanceSide)).toEqual([
                "ONE",
                "TWO",
                "ONE",
            ]);
        });

        it("should resolve the winner and loser commitments", () => {
            expect(getWinner(match)).toBe(two);
            expect(getLoser(match)).toBe(one);
        });

        it("should have no winner or loser while undecided", () => {
            const pending = createMatch({ winnerCommitment: "NONE" });

            expect(getWinner(pending)).toBeNull();
            expect(getLoser(pending)).toBeNull();
        });

        it("should read the responder only while bisecting", () => {
            const bisecting = createMatch({
                snapshot: createMatchSnapshot({
                    phase: "BISECTING",
                    bisection: {
                        ...createBisection({ responder: "TWO" }),
                        currentHeight: 4n,
                    },
                    sealed: null,
                }),
            });

            expect(getResponder(bisecting)).toBe("TWO");
            expect(
                getResponder(createMatch({ deletionReason: "STEP" })),
            ).toBeNull();
        });
    });

    describe("getBlocksLeft", () => {
        it("should count the blocks until the deadline", () => {
            expect(getBlocksLeft(120n, 100n)).toBe(20n);
        });

        it("should not go below zero after the deadline", () => {
            expect(getBlocksLeft(90n, 100n)).toBe(0n);
        });
    });
});
