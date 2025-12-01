import type { Commitment, Match, Tournament } from "@cartesi/viem";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { zeroHash } from "viem";
import { claim, generateMatchID } from "../../stories/util";
import { TournamentView } from "./TournamentView";

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
    {
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
    },
    {
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
    },
    {
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
    },
    {
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
    },
];

const tournament: Tournament = {
    address: "0x61bcab9d0d8b554009824292d2d6855dfa3aab86",
    createdAt: new Date(timestamp),
    epochIndex,
    finalStateHash: null,
    finishedAtBlock: 2n,
    height: 48n,
    level: 0n,
    log2step: 0x2cn,
    maxLevel: 3n,
    parentMatchIdHash: null,
    parentTournamentAddress: null,
    updatedAt: new Date(timestamp),
    winnerCommitment: null,
};

const commitments: Commitment[] = Array.from({ length: 7 }, (_, i) => ({
    blockNumber: BigInt(i + 1),
    commitment: claim(i).hash,
    createdAt: new Date(timestamp + i),
    epochIndex,
    finalStateHash: zeroHash,
    submitterAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    tournamentAddress,
    txHash: "0x06ad8f0ce427010498fbb2388b432f6d578e4e1ffe5dbf20869629b09dcf0d70",
    updatedAt: new Date(timestamp + i),
}));

export const Ongoing: Story = {
    args: {
        commitments,
        matches,
        tournament,
    },
};

export const NoChallengerYet: Story = {
    args: {
        tournament: {
            address: "0x61bcab9d0d8b554009824292d2d6855dfa3aab86",
            createdAt: new Date(timestamp),
            epochIndex,
            finalStateHash: null,
            finishedAtBlock: 2n,
            log2step: 0x2cn,
            maxLevel: 3n,
            parentMatchIdHash: null,
            parentTournamentAddress: null,
            updatedAt: new Date(timestamp),
            height: 48n,
            level: 0n,
            winnerCommitment: null,
        },
        matches: [],
        commitments: [
            {
                blockNumber: 1n,
                commitment: claim(0).hash,
                createdAt: new Date(timestamp),
                epochIndex,
                finalStateHash: zeroHash,
                submitterAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                tournamentAddress,
                txHash: "0x06ad8f0ce427010498fbb2388b432f6d578e4e1ffe5dbf20869629b09dcf0d70",
                updatedAt: new Date(timestamp),
            },
        ],
    },
};

export const Finalized: Story = {
    args: {
        tournament: {
            address: "0x61bcab9d0d8b554009824292d2d6855dfa3aab86",
            createdAt: new Date(timestamp),
            epochIndex,
            finalStateHash: zeroHash,
            finishedAtBlock: 2n,
            log2step: 0x2cn,
            maxLevel: 3n,
            parentMatchIdHash: null,
            parentTournamentAddress: null,
            updatedAt: new Date(timestamp),
            height: 48n,
            level: 0n,
            winnerCommitment: claim(0).hash,
        },
        matches: [],
        commitments: [
            {
                blockNumber: 1n,
                commitment: claim(0).hash,
                createdAt: new Date(timestamp),
                epochIndex,
                tournamentAddress,
                finalStateHash: zeroHash,
                submitterAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                txHash: "0x06ad8f0ce427010498fbb2388b432f6d578e4e1ffe5dbf20869629b09dcf0d70",
                updatedAt: new Date(timestamp),
            },
        ],
    },
};

export const MidLevelDispute: Story = {
    args: {
        commitments: [],
        tournament: {
            address: "0x61bcab9d0d8b554009824292d2d6855dfa3aab86",
            createdAt: new Date(timestamp),
            epochIndex,
            finalStateHash: null,
            finishedAtBlock: 2n,
            log2step: 0x2cn,
            maxLevel: 3n,
            parentMatchIdHash: null,
            parentTournamentAddress: null,
            updatedAt: new Date(timestamp),
            height: 27n,
            level: 1n,
            winnerCommitment: null,
        },
        matches: [
            {
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
            },
            {
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
            },
        ],
    },
};
