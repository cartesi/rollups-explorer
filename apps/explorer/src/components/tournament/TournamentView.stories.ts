import type { BondEvent, Commitment, Match, Tournament } from "@cartesi/client";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { zeroHash, type Address } from "viem";
import { claim, generateMatchID } from "../../stories/util";
import { TournamentView } from "./TournamentView";
import { getBondTotals } from "../../lib/bondUtils";
import {
    createBondEvent,
    createCommitment,
    createJoinBond,
    createMatch,
    createMatchSnapshot,
    createTournament,
} from "../../stories/prt";
import * as BondLedgerStories from "../bond/BondLedger.stories";

const meta = {
    title: "Components/Tournament/TournamentView",
    component: TournamentView,
    tags: ["autodocs"],
} satisfies Meta<typeof TournamentView>;

export default meta;
type Story = StoryObj<typeof meta>;

const timestamp = Date.now();
const epochIndex = 0n;
const tournamentAddress = "0x61bcab9d0d8b554009824292d2d6855dfa3aab86";
const bondValue = 21_300_000_000_000_000n;

/**
 * Bond values by tournament level, proportional to the work of a full match at
 * each level's height.
 */
const levelBondValues = [
    bondValue,
    7_500_000_000_000_000n,
    12_000_000_000_000_000n,
];

/**
 * The bond pool of the joined commitments: every join posted the level bond
 * value, and the balance is what is left after the given bond events.
 */
const poolFor = (joined: Commitment[], events: BondEvent[] = [], level = 0) => {
    const value = levelBondValues[level];
    const { refunded, paid, burned } = getBondTotals(events);
    return {
        balance: BigInt(joined.length) * value - refunded - paid - burned,
        bondValue: value,
        bonds: joined.map((commitment) =>
            createJoinBond(commitment, { value }),
        ),
    };
};

const matches: Match[] = [
    createMatch({
        blockNumber: 1n,
        commitmentOne: claim(0).hash,
        commitmentTwo: claim(1).hash,
        createdAt: new Date(timestamp + 1),
        deletionBlockNumber: 1n,
        deletionReason: "CHILD_TOURNAMENT",
        deletionTxHash:
            "0x06ad8f0ce427010498fbb2388b432f6d578e4e1ffe5dbf20869629b09dcf0d70",
        epochIndex,
        idHash: generateMatchID(claim(0).hash, claim(1).hash),
        leftOfTwo:
            "0x7b39d1c90850f72daa51599ec1ff041aa5b1eda8f6ef1d00ce853b8f89462002",
        tournamentAddress,
        txHash: "0x06ad8f0ce427010498fbb2388b432f6d578e4e1ffe5dbf20869629b09dcf0d70",
        updatedAt: new Date(timestamp + 1),
        winnerCommitment: "ONE",
    }),
    createMatch({
        blockNumber: 2n,
        commitmentOne: claim(2).hash,
        commitmentTwo: claim(3).hash,
        createdAt: new Date(timestamp + 2),
        deletionBlockNumber: null,
        deletionReason: "NOT_DELETED",
        deletionTxHash: null,
        epochIndex,
        idHash: generateMatchID(claim(2).hash, claim(3).hash),
        leftOfTwo:
            "0x7b39d1c90850f72daa51599ec1ff041aa5b1eda8f6ef1d00ce853b8f89462002",
        tournamentAddress,
        txHash: "0x06ad8f0ce427010498fbb2388b432f6d578e4e1ffe5dbf20869629b09dcf0d70",
        updatedAt: new Date(timestamp + 2),
        winnerCommitment: "NONE",
    }),
    createMatch({
        blockNumber: 3n,
        commitmentOne: claim(4).hash,
        commitmentTwo: claim(5).hash,
        createdAt: new Date(timestamp + 3),
        deletionBlockNumber: null,
        deletionReason: "CHILD_TOURNAMENT",
        deletionTxHash: null,
        epochIndex,
        idHash: generateMatchID(claim(4).hash, claim(5).hash),
        leftOfTwo:
            "0x7b39d1c90850f72daa51599ec1ff041aa5b1eda8f6ef1d00ce853b8f89462002",
        tournamentAddress,
        txHash: "0x06ad8f0ce427010498fbb2388b432f6d578e4e1ffe5dbf20869629b09dcf0d70",
        updatedAt: new Date(timestamp + 3),
        winnerCommitment: "ONE",
    }),
    createMatch({
        blockNumber: 4n,
        commitmentOne: claim(6).hash,
        commitmentTwo: claim(4).hash,
        createdAt: new Date(timestamp + 4),
        deletionBlockNumber: null,
        deletionReason: "CHILD_TOURNAMENT",
        deletionTxHash: null,
        epochIndex,
        idHash: generateMatchID(claim(6).hash, claim(4).hash),
        leftOfTwo:
            "0x7b39d1c90850f72daa51599ec1ff041aa5b1eda8f6ef1d00ce853b8f89462002",
        tournamentAddress,
        txHash: "0x06ad8f0ce427010498fbb2388b432f6d578e4e1ffe5dbf20869629b09dcf0d70",
        updatedAt: new Date(timestamp + 4),
        winnerCommitment: "NONE",
    }),
];

const tournament: Tournament = createTournament({
    address: "0x61bcab9d0d8b554009824292d2d6855dfa3aab86",
    createdAt: new Date(timestamp),
    epochIndex,
    height: 48n,
    level: 0n,
    log2step: 0x2cn,
    maxLevel: 3n,
    parentMatchIdHash: null,
    parentTournamentAddress: null,
    updatedAt: new Date(timestamp),
    snapshot: { standing: "MATCHES_ACTIVE", candidate: claim(6).hash },
});

const commitments: Commitment[] = Array.from({ length: 7 }, (_, i) =>
    createCommitment({
        blockNumber: BigInt(i + 1),
        commitment: claim(i).hash,
        createdAt: new Date(timestamp + i),
        epochIndex,
        finalStateHash: zeroHash,
        submitterAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        tournamentAddress,
        txHash: "0x06ad8f0ce427010498fbb2388b432f6d578e4e1ffe5dbf20869629b09dcf0d70",
        updatedAt: new Date(timestamp + i),
    }),
);

export const Ongoing: Story = {
    args: {
        bondPool: poolFor(commitments),
        commitments,
        matches,
        tournament,
    },
};

const soloCommitments: Commitment[] = [
    createCommitment({
        blockNumber: 1n,
        commitment: claim(0).hash,
        createdAt: new Date(timestamp),
        epochIndex,
        finalStateHash: zeroHash,
        submitterAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        tournamentAddress,
        txHash: "0x06ad8f0ce427010498fbb2388b432f6d578e4e1ffe5dbf20869629b09dcf0d70",
        updatedAt: new Date(timestamp),
    }),
];

export const NoChallengerYet: Story = {
    args: {
        tournament: createTournament({
            address: "0x61bcab9d0d8b554009824292d2d6855dfa3aab86",
            createdAt: new Date(timestamp),
            epochIndex,
            log2step: 0x2cn,
            maxLevel: 3n,
            parentMatchIdHash: null,
            parentTournamentAddress: null,
            updatedAt: new Date(timestamp),
            height: 48n,
            level: 0n,
            snapshot: { standing: "MATCHES_ACTIVE", candidate: claim(0).hash },
        }),
        matches: [],
        commitments: soloCommitments,
        bondPool: poolFor(soloCommitments),
    },
};

const winnerCommitments: Commitment[] = [
    createCommitment({
        blockNumber: 1n,
        commitment: claim(0).hash,
        createdAt: new Date(timestamp),
        epochIndex,
        tournamentAddress,
        finalStateHash: zeroHash,
        submitterAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        txHash: "0x06ad8f0ce427010498fbb2388b432f6d578e4e1ffe5dbf20869629b09dcf0d70",
        updatedAt: new Date(timestamp),
    }),
];

export const Finalized: Story = {
    args: {
        tournament: createTournament({
            address: "0x61bcab9d0d8b554009824292d2d6855dfa3aab86",
            createdAt: new Date(timestamp),
            epochIndex,
            log2step: 0x2cn,
            maxLevel: 3n,
            parentMatchIdHash: null,
            parentTournamentAddress: null,
            updatedAt: new Date(timestamp),
            height: 48n,
            level: 0n,
            snapshot: {
                standing: "ROOT_WINNER",
                candidate: claim(0).hash,
                asOfBlock: 2n,
                finalStateHash: zeroHash,
                finishedAtBlock: 2n,
                winnerCommitment: claim(0).hash,
                bondRecovery: {
                    disposition: "RECOVERABLE",
                    claimer: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                    payment: bondValue,
                },
            },
        }),
        matches: [],
        commitments: winnerCommitments,
        bondPool: poolFor(winnerCommitments),
    },
};

const midCommitments: Commitment[] = [
    createCommitment({
        blockNumber: 1n,
        commitment: claim(7).hash,
        createdAt: new Date(timestamp),
        epochIndex,
        tournamentAddress,
        finalStateHash: zeroHash,
        submitterAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        txHash: "0x06ad8f0ce427010498fbb2388b432f6d578e4e1ffe5dbf20869629b09dcf0d70",
        updatedAt: new Date(timestamp),
    }),
    createCommitment({
        blockNumber: 1n,
        commitment: claim(8).hash,
        createdAt: new Date(timestamp),
        epochIndex,
        tournamentAddress,
        finalStateHash: zeroHash,
        submitterAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        txHash: "0x06ad8f0ce427010498fbb2388b432f6d578e4e1ffe5dbf20869629b09dcf0d70",
        updatedAt: new Date(timestamp),
    }),
    createCommitment({
        blockNumber: 1n,
        commitment: claim(9).hash,
        createdAt: new Date(timestamp),
        epochIndex,
        tournamentAddress,
        finalStateHash: zeroHash,
        submitterAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        txHash: "0x06ad8f0ce427010498fbb2388b432f6d578e4e1ffe5dbf20869629b09dcf0d70",
        updatedAt: new Date(timestamp),
    }),
    createCommitment({
        blockNumber: 1n,
        commitment: claim(10).hash,
        createdAt: new Date(timestamp),
        epochIndex,
        tournamentAddress,
        finalStateHash: zeroHash,
        submitterAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        txHash: "0x06ad8f0ce427010498fbb2388b432f6d578e4e1ffe5dbf20869629b09dcf0d70",
        updatedAt: new Date(timestamp),
    }),
];

export const MidLevelDispute: Story = {
    args: {
        commitments: midCommitments,
        bondPool: poolFor(midCommitments, [], 1),
        tournament: createTournament({
            address: "0x61bcab9d0d8b554009824292d2d6855dfa3aab86",
            createdAt: new Date(timestamp),
            epochIndex,
            log2step: 27n,
            maxLevel: 3n,
            parentMatchIdHash: null,
            parentTournamentAddress: null,
            updatedAt: new Date(timestamp),
            height: 17n,
            level: 1n,
            snapshot: { standing: "MATCHES_ACTIVE" },
        }),
        matches: [
            createMatch({
                idHash: generateMatchID(claim(7, 5).hash, claim(8, 4).hash),
                commitmentOne: claim(7, 5).hash,
                commitmentTwo: claim(8, 4).hash,
                blockNumber: 1n,
                createdAt: new Date(timestamp),
                deletionBlockNumber: null,
                deletionReason: "NOT_DELETED",
                deletionTxHash: null,
                epochIndex,
                leftOfTwo:
                    "0x7b39d1c90850f72daa51599ec1ff041aa5b1eda8f6ef1d00ce853b8f89462002",
                tournamentAddress,
                txHash: "0x06ad8f0ce427010498fbb2388b432f6d578e4e1ffe5dbf20869629b09dcf0d70",
                updatedAt: new Date(timestamp),
                winnerCommitment: "NONE",
            }),
            createMatch({
                idHash: generateMatchID(claim(9, 5).hash, claim(10, 4).hash),
                commitmentOne: claim(9, 5).hash,
                commitmentTwo: claim(10, 4).hash,
                blockNumber: 1n,
                createdAt: new Date(timestamp),
                deletionBlockNumber: null,
                deletionReason: "NOT_DELETED",
                deletionTxHash: null,
                epochIndex,
                leftOfTwo:
                    "0x7b39d1c90850f72daa51599ec1ff041aa5b1eda8f6ef1d00ce853b8f89462002",
                tournamentAddress,
                txHash: "0x06ad8f0ce427010498fbb2388b432f6d578e4e1ffe5dbf20869629b09dcf0d70",
                updatedAt: new Date(timestamp),
                winnerCommitment: "NONE",
            }),
        ],
    },
};

const rootTournamentAddress: Address =
    "0xA2835312696Afa86c969e40831857dbB1412627f";

const parentMatch = createMatch({
    commitmentOne: claim(0).hash,
    commitmentTwo: claim(1).hash,
    tournamentAddress: rootTournamentAddress,
    snapshot: createMatchSnapshot({
        phase: "SEALED",
        bisection: null,
        sealed: {
            agreeState: zeroHash,
            divergencePosition: 1024n,
            divergenceCycle: 1024n << 44n,
            finalStateOne: zeroHash,
            finalStateTwo: zeroHash,
        },
    }),
});

const innerTournament = {
    ...MidLevelDispute.args.tournament,
    parentTournamentAddress: rootTournamentAddress,
    parentMatchIdHash: parentMatch.idHash,
};

/**
 * The inner tournament has a live winner until block 180. Anyone can
 * propagate it to the parent match before then.
 */
export const ProvisionalInnerWinner: Story = {
    parameters: { connectionType: "system" },
    args: {
        ...MidLevelDispute.args,
        tournament: {
            ...innerTournament,
            snapshot: {
                ...MidLevelDispute.args.tournament.snapshot,
                standing: "INNER_WINNER",
                candidate: claim(7, 5).hash,
                winnerCommitment: claim(7, 5).hash,
                finalStateHash: zeroHash,
                finishedAtBlock: 90n,
                winnerExpiresAt: 180n,
                innerResult: {
                    disposition: "WINNER",
                    parentCommitment: parentMatch.commitmentOne,
                    pausedAllowance: 500n,
                },
            },
        },
        parent: {
            match: parentMatch,
            winnerChildren: [claim(0, 1).hash, claim(0, 2).hash],
        },
    },
};

/**
 * The inner winner expired before anyone propagated it, so the only call left
 * closes the parent match without a winner.
 */
export const ExpiredInnerWinner: Story = {
    parameters: { connectionType: "system" },
    args: {
        ...MidLevelDispute.args,
        tournament: {
            ...innerTournament,
            snapshot: {
                ...MidLevelDispute.args.tournament.snapshot,
                standing: "INNER_ELIMINABLE_WINNER_EXPIRED",
                candidate: claim(7, 5).hash,
                finishedAtBlock: 90n,
                innerResult: {
                    disposition: "ELIMINABLE",
                    parentCommitment: null,
                    pausedAllowance: 0n,
                },
            },
        },
        parent: { match: parentMatch },
    },
};

/**
 * An ongoing dispute with gas refunds paid for each move.
 */
export const RefundsOngoing: Story = {
    args: {
        ...Ongoing.args,
        bondEvents: BondLedgerStories.Ongoing.args.events,
        bondPool: poolFor(commitments, BondLedgerStories.Ongoing.args.events),
    },
};

/**
 * An ongoing dispute where every gas refund payment failed.
 */
export const WithFailedRefunds: Story = {
    args: {
        ...Ongoing.args,
        bondEvents: BondLedgerStories.AllRefundsFailed.args.events,
        bondPool: poolFor(
            commitments,
            BondLedgerStories.AllRefundsFailed.args.events,
        ),
    },
};

/**
 * A finalized tournament whose winner already recovered the bond.
 */
const uncontestedRecovery = [
    createBondEvent({
        blockNumber: 3n,
        logIndex: 0n,
        type: "BOND_RECOVERED",
        refund: null,
        recovery: {
            commitment: claim(0).hash,
            claimer: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            payment: bondValue,
            burned: 0n,
        },
    }),
];

/**
 * Uncontested, the pool still held exactly one bond, so the winner's claimer
 * got all of it back and nothing was burned.
 */
export const BondRecovered: Story = {
    args: {
        ...Finalized.args,
        tournament: {
            ...Finalized.args.tournament,
            snapshot: {
                ...Finalized.args.tournament.snapshot,
                bondRecovery: {
                    disposition: "RECOVERED",
                    claimer: null,
                    payment: null,
                },
            },
        },
        bondEvents: uncontestedRecovery,
        bondPool: poolFor(winnerCommitments, uncontestedRecovery),
    },
};

/**
 * A middle-level tournament covers one root leaf: 16,777,216 mcycles of one
 * input, with 128-mcycle leaves.
 */
export const MiddleLevelGeometry: Story = {
    args: {
        ...MidLevelDispute.args,
        tournament: {
            ...MidLevelDispute.args.tournament,
            level: 1n,
            log2step: 27n,
            height: 17n,
            baseCycle: (3n << 68n) + (21_990_349_996_032n << 20n),
        },
    },
};

/**
 * A bottom-level tournament covers one middle leaf: 128 mcycles resolved to
 * single ucycles.
 */
export const BottomLevelGeometry: Story = {
    args: {
        ...MidLevelDispute.args,
        tournament: {
            ...MidLevelDispute.args.tournament,
            level: 2n,
            log2step: 0n,
            height: 27n,
            kind: "LEAF",
            baseCycle: (3n << 68n) + (21_990_354_846_080n << 20n),
        },
        bondPool: poolFor(midCommitments, [], 2),
    },
};

/**
 * A finished tournament whose winner has not recovered the bond yet. The
 * story uses a regular connection, as the recover action is hidden for
 * mocked data.
 */
export const RecoverableBond: Story = {
    parameters: { connectionType: "system" },
    args: {
        ...Finalized.args,
        tournament: {
            ...Finalized.args.tournament,
            snapshot: {
                ...Finalized.args.tournament.snapshot,
                bondRecovery: {
                    disposition: "RECOVERABLE",
                    claimer: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                    payment: bondValue,
                },
            },
        },
        bondPool: {
            balance: bondValue,
            bondValue,
            bonds: Finalized.args.commitments.map((commitment) =>
                createJoinBond(commitment, { value: bondValue }),
            ),
        },
    },
};

const joinBonds = (joined: Commitment[]) =>
    joined.map((commitment) =>
        createJoinBond(commitment, { value: bondValue }),
    );

const balanceAfter = (joins: number, events = Ongoing.args.bondEvents ?? []) =>
    BigInt(joins) * bondValue - getBondTotals(events).refunded;

/**
 * A running tournament shows only its bond pool: what the joins deposited,
 * the gas refunds paid from it and the balance left.
 */
export const BondPoolRunning: Story = {
    args: {
        ...RefundsOngoing.args,
        bondPool: {
            balance: balanceAfter(
                commitments.length,
                RefundsOngoing.args.bondEvents,
            ),
            bondValue,
            bonds: joinBonds(commitments),
        },
    },
};

/**
 * One claim joined through another contract, so the deposited total is only
 * a minimum.
 */
export const BondPoolRelayedJoin: Story = {
    args: {
        ...BondPoolRunning.args,
        bondPool: {
            ...BondPoolRunning.args.bondPool!,
            bonds: joinBonds(commitments).map((bond, index) =>
                index === 1 ? { ...bond, exact: false } : bond,
            ),
        },
    },
};

/**
 * The bond value, join bonds and balance are still loading.
 */
export const BondPoolLoading: Story = {
    args: {
        ...RefundsOngoing.args,
        bondPool: { bonds: [], loading: true },
    },
};

const disputed = [
    Finalized.args.commitments[0],
    createCommitment({
        blockNumber: 2n,
        commitment: claim(1).hash,
        epochIndex,
        tournamentAddress,
        submitterAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    }),
];

const disputeRefunds = Array.from({ length: 10 }, (_, index) =>
    createBondEvent({
        blockNumber: BigInt(index + 3),
        logIndex: BigInt(index),
        refund: {
            recipient: disputed[index % 2].submitterAddress,
            value: 310_000_000_000_000n,
            success: true,
        },
    }),
);

const disputedBalance = balanceAfter(disputed.length, disputeRefunds);
const winnerPayment = bondValue + (disputedBalance - bondValue) / 10n;

/**
 * After a dispute, the winner's claimer got one bond plus a tenth of the
 * residual, and the rest was burned, leaving the tournament empty.
 */
export const BondPoolRecovered: Story = {
    args: {
        ...BondRecovered.args,
        commitments: disputed,
        bondEvents: [
            ...disputeRefunds,
            createBondEvent({
                blockNumber: 20n,
                logIndex: 0n,
                type: "BOND_RECOVERED",
                refund: null,
                recovery: {
                    commitment: claim(0).hash,
                    claimer: disputed[0].submitterAddress,
                    payment: winnerPayment,
                    burned: disputedBalance - winnerPayment,
                },
            }),
        ],
        bondPool: {
            balance: 0n,
            bondValue,
            bonds: joinBonds(disputed),
        },
    },
};

/**
 * The root tournament finished without a winner, so its balance stays locked
 * in the contract.
 */
export const BondPoolNoWinner: Story = {
    args: {
        ...Finalized.args,
        tournament: {
            ...Finalized.args.tournament,
            snapshot: {
                ...Finalized.args.tournament.snapshot,
                standing: "ROOT_FAILED",
                candidate: null,
                winnerCommitment: null,
                finalStateHash: null,
                bondRecovery: {
                    disposition: "NO_WINNER",
                    claimer: null,
                    payment: null,
                },
            },
        },
        commitments: disputed,
        bondEvents: disputeRefunds,
        bondPool: {
            balance: disputedBalance,
            bondValue,
            bonds: joinBonds(disputed),
        },
    },
};
