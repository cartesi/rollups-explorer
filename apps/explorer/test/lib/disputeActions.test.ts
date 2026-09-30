import { describe, expect, it } from "vitest";
import {
    getMatchTimeoutAction,
    getTimeoutWinExpiry,
} from "../../src/lib/disputeActions";
import {
    createCommitment,
    createMatch,
    createMatchSnapshot,
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
