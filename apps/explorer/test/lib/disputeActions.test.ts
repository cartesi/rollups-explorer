import { describe, expect, it } from "vitest";
import { keccak256, toHex } from "viem";
import {
    getInnerTournamentAction,
    getInnerWinExpiry,
    getMatchTimeoutAction,
    getTimeoutWinExpiry,
} from "../../src/lib/disputeActions";
import {
    createCommitment,
    createMatch,
    createMatchSnapshot,
    createTournament,
} from "../../src/stories/prt";

const withOutcome = (
    timeoutOutcome: "NONE" | "ONE_WINS" | "TWO_WINS" | "ELIMINATE_BOTH",
    deferredCharge = 0n,
) =>
    createMatch({
        snapshot: createMatchSnapshot({ timeoutOutcome, deferredCharge }),
    });

describe("getMatchTimeoutAction", () => {
    it("should offer a win to the side that still has time", () => {
        expect(getMatchTimeoutAction(withOutcome("ONE_WINS"))).toEqual({
            kind: "win",
            side: "ONE",
        });
        expect(getMatchTimeoutAction(withOutcome("TWO_WINS"))).toEqual({
            kind: "win",
            side: "TWO",
        });
    });

    it("should offer eliminating both when neither has time", () => {
        expect(getMatchTimeoutAction(withOutcome("ELIMINATE_BOTH"))).toEqual({
            kind: "eliminate",
        });
    });

    it("should offer nothing without a timeout or once the match is closed", () => {
        expect(getMatchTimeoutAction(withOutcome("NONE"))).toBeNull();
        expect(
            getMatchTimeoutAction({
                ...withOutcome("ONE_WINS"),
                deletionReason: "TIMEOUT",
            }),
        ).toBeNull();
    });
});

describe("getTimeoutWinExpiry", () => {
    it("should count down the paused survivor's allowance by the deferred charge", () => {
        const survivor = createCommitment({
            snapshot: { clockRunning: false, clockAllowance: 320n },
        });

        expect(
            getTimeoutWinExpiry(withOutcome("ONE_WINS", 20n), survivor),
        ).toBe(300n);
    });

    it("should use the running survivor's deadline in a leaf race", () => {
        const survivor = createCommitment({
            snapshot: {
                asOfBlock: 1200n,
                clockRunning: true,
                clockDeadline: 1250n,
            },
        });

        expect(getTimeoutWinExpiry(withOutcome("ONE_WINS"), survivor)).toBe(
            50n,
        );
    });

    it("should tell nothing without the survivor or time left", () => {
        expect(getTimeoutWinExpiry(withOutcome("ONE_WINS"))).toBeUndefined();
        expect(
            getTimeoutWinExpiry(
                withOutcome("ONE_WINS", 320n),
                createCommitment({ snapshot: { clockAllowance: 320n } }),
            ),
        ).toBeUndefined();
    });
});

const parentCommitment = keccak256(toHex("parent"));
const child = (
    disposition: "UNSETTLED" | "WINNER" | "ELIMINABLE",
    winnerExpiresAt = 180n,
) =>
    createTournament({
        level: 1n,
        parentTournamentAddress: "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
        parentMatchIdHash: keccak256(toHex("match")),
        snapshot: {
            asOfBlock: 100n,
            winnerExpiresAt,
            innerResult: {
                disposition,
                parentCommitment:
                    disposition === "WINNER" ? parentCommitment : null,
                pausedAllowance: 500n,
            },
        },
    });
const sealed = createMatch({
    snapshot: createMatchSnapshot({ phase: "UNINITIALIZED" }),
});

describe("getInnerTournamentAction", () => {
    it("should propagate a live winner to the parent", () => {
        expect(getInnerTournamentAction(child("WINNER"), sealed)).toEqual({
            kind: "win",
            parentCommitment,
        });
    });

    it("should close the parent match when the inner tournament is eliminable", () => {
        expect(getInnerTournamentAction(child("ELIMINABLE"), sealed)).toEqual({
            kind: "eliminate",
        });
    });

    it("should offer nothing for an expired, unsettled or already settled result", () => {
        expect(
            getInnerTournamentAction(child("WINNER", 100n), sealed),
        ).toBeNull();
        expect(getInnerTournamentAction(child("UNSETTLED"), sealed)).toBeNull();
        expect(
            getInnerTournamentAction(child("WINNER"), {
                ...sealed,
                deletionReason: "CHILD_TOURNAMENT",
            }),
        ).toBeNull();
    });

    it("should offer nothing without the parent match or for a root", () => {
        expect(getInnerTournamentAction(child("WINNER"))).toBeNull();
        expect(
            getInnerTournamentAction(
                { ...child("WINNER"), parentTournamentAddress: null },
                sealed,
            ),
        ).toBeNull();
    });
});

describe("getInnerWinExpiry", () => {
    it("should count the blocks left before the winner expires", () => {
        expect(getInnerWinExpiry(child("WINNER"))).toBe(80n);
        expect(getInnerWinExpiry(child("WINNER", 100n))).toBeUndefined();
    });
});
