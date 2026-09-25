/**
 * Content/copy for match related messages.
 */
export const matchMessages = {
    phaseTxt: "Phase",
    heightTxt: "Height",
    segmentTxt: "Segment",
    segmentSizeTxt: "Segment size",
    responderTxt: "Responder",
    divergenceTxt: "Divergence",
    agreeStateTxt: "Agree state",
    leafSealedTxt: "Leaf sealed",
    clocksTxt: "Clocks",
    asOfBlockTxt: "as of block",
    phase: {
        UNINITIALIZED: "not started",
        BISECTING: "bisecting",
        READY_TO_SEAL: "ready to seal",
        SEALED: "sealed",
        closed: "closed",
    },
    closedHint:
        "A closed match cannot change, so the node does not read it again. Its observation block can be older than the tournament's.",
    timeoutOutcome: {
        ONE_WINS: "Commitment one can win by timeout",
        TWO_WINS: "Commitment two can win by timeout",
        ELIMINATE_BOTH: "Both commitments can be eliminated by timeout",
    },
    leafSeal: {
        atBlockTxt: "at block",
        eliminableAtBlockTxt: "both eliminable at block",
    },
    deferredCharge: {
        prefixTxt: "Deferred charge of",
        suffixTxt: "blocks",
    },
    gasRefund: {
        leafSealTxt: "Leaf seal gas refund",
        subTournamentCreationTxt: "Sub-tournament creation gas refund",
        matchClosingTxt: "Match closing gas refund",
    },
    proof: {
        viewTxt: "View proof",
        unavailableTxt: "Step proof not available",
        unavailableHint:
            "The winning transaction is not a direct winLeafMatch call, for example it went through another contract, so the proof cannot be read from it.",
    },
    clock: {
        runningTxt: "clock running",
        pausedTxt: "clock paused",
        inactiveTxt: "inactive",
        inactiveHint:
            "The commitment has no claimer anymore: it was eliminated or its bond was recovered.",
        deadlineAtBlockTxt: "deadline at block",
        blocksLeftTxt: "blocks left",
        allowanceTxt: "blocks of allowance",
    },
} as const;
