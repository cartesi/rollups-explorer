import type { Commitment, Match, Tournament } from "@cartesi/client";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { zeroHash } from "viem";
import { claim, generateMatchID } from "../../stories/util";
import { TournamentView } from "./TournamentView";
import {
    createCommitment,
    createMatch,
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
        commitments,
        matches,
        tournament,
    },
};

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
        commitments: [
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
        ],
    },
};

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
            },
        }),
        matches: [],
        commitments: [
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
        ],
    },
};

export const MidLevelDispute: Story = {
    args: {
        commitments: [
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
        ],
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

export const ProvisionalInnerWinner: Story = {
    args: {
        ...MidLevelDispute.args,
        tournament: {
            ...MidLevelDispute.args.tournament,
            snapshot: {
                ...MidLevelDispute.args.tournament.snapshot,
                standing: "INNER_WINNER",
                candidate: claim(7, 5).hash,
                winnerCommitment: claim(7, 5).hash,
                finalStateHash: zeroHash,
                finishedAtBlock: 90n,
                winnerExpiresAt: 180n,
            },
        },
    },
};

export const ExpiredInnerWinner: Story = {
    args: {
        ...MidLevelDispute.args,
        tournament: {
            ...MidLevelDispute.args.tournament,
            snapshot: {
                ...MidLevelDispute.args.tournament.snapshot,
                standing: "INNER_ELIMINABLE_WINNER_EXPIRED",
                candidate: claim(7, 5).hash,
                finishedAtBlock: 90n,
            },
        },
    },
};

/**
 * An ongoing dispute with gas refunds paid for each move.
 */
export const RefundsOngoing: Story = {
    args: {
        ...Ongoing.args,
        bondEvents: BondLedgerStories.Ongoing.args.events,
    },
};

/**
 * An ongoing dispute where every gas refund payment failed.
 */
export const WithFailedRefunds: Story = {
    args: {
        ...Ongoing.args,
        bondEvents: BondLedgerStories.AllRefundsFailed.args.events,
    },
};

/**
 * A finalized tournament whose winner already recovered the bond.
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
        bondEvents: BondLedgerStories.Recovered.args.events,
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
                    payment: 250_000_000_000_000_000n,
                },
            },
        },
    },
};
