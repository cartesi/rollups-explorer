import type { Meta, StoryObj } from "@storybook/nextjs";
import { randomAdvances } from "../../stories/data";
import { claim } from "../../stories/util";
import { MatchActions } from "./MatchActions";

const meta = {
    title: "Components/Match/MatchActions",
    component: MatchActions,
    tags: ["autodocs"],
} satisfies Meta<typeof MatchActions>;

export default meta;
type Story = StoryObj<typeof meta>;

const epochIndex = 0n;
const tournamentAddress = "0x61bcab9d0d8b554009824292d2d6855dfa3aab86";
const idHash =
    "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6";
const leftOfTwo =
    "0x7b39d1c90850f72daa51599ec1ff041aa5b1eda8f6ef1d00ce853b8f89462002";
const now = Date.now();

// large 40kb proof
// const proof = `0x${"00".repeat(1024 * 40)}` as Hex;

/**
 * Complete scenario for a top match with a winner.
 */

export const CompleteTop: Story = {
    args: {
        advances: randomAdvances({
            count: 47,
            epochIndex,
            idHash,
            leftOfTwo,
            now: now - 7966,
            tournamentAddress,
        }),
        match: {
            blockNumber: 1n,
            commitmentOne: claim(0).hash,
            commitmentTwo: claim(1).hash,
            createdAt: new Date(now),
            deletionBlockNumber: 10n,
            deletionReason: "CHILD_TOURNAMENT",
            deletionTxHash:
                "0x06ad8f0ce427010498fbb2388b432f6d578e4e1ffe5dbf20869629b09dcf0d70",
            epochIndex: 0n,
            idHash,
            leftOfTwo,
            tournamentAddress,
            txHash: "0x06ad8f0ce427010498fbb2388b432f6d578e4e1ffe5dbf20869629b09dcf0d70",
            updatedAt: new Date(now),
            winnerCommitment: "ONE",
        },
        height: 48n,
        now,
        nextLevel: 1n,
    },
};

/**
 * A match where both claimers are advancing.
 */
export const Bisections: Story = {
    args: {
        advances: [
            {
                blockNumber: 1n,
                createdAt: new Date(now - 3453),
                epochIndex,
                idHash,
                leftNode:
                    "0xc2a1e4406e117170e1539376ae0b2bf8a8ba65dd241ac4cc6a19efb376041f54",
                otherParent:
                    "0x7b39d1c90850f72daa51599ec1ff041aa5b1eda8f6ef1d00ce853b8f89462002",
                tournamentAddress,
                txHash: "0x7b39d1c90850f72daa51599ec1ff041aa5b1eda8f6ef1d00ce853b8f89462002",
                updatedAt: new Date(now - 3453),
            },
            {
                blockNumber: 2n,
                createdAt: new Date(now - 2134),
                epochIndex,
                idHash,
                leftNode:
                    "0xaa5945bb1c145a6ddde89bacffbda841a4049af4f20bb32f79dad4a14eef6bf3",
                otherParent:
                    "0xc2a1e4406e117170e1539376ae0b2bf8a8ba65dd241ac4cc6a19efb376041f54",
                tournamentAddress,
                txHash: "0x89f986df6290a9157862849a6a0b92df8b170bcaca15a7c4ac8ba15886d53bd3",
                updatedAt: new Date(now - 2134),
            },
            {
                blockNumber: 3n,
                createdAt: new Date(now - 1452),
                epochIndex,
                idHash,
                leftNode:
                    "0x96e1b82f2632d0b5ce9d406f26db76a3e9a7aef1cff0c29ffcbd3d193c508919",
                otherParent:
                    "0xaa5945bb1c145a6ddde89bacffbda841a4049af4f20bb32f79dad4a14eef6bf3",
                tournamentAddress,
                txHash: "0x75ea44f31192dd174cb1834ca1f41deea2d33f22cfd3841f6ad799099ed76d96",
                updatedAt: new Date(now - 1452),
            },
            {
                blockNumber: 4n,
                createdAt: new Date(now - 345),
                epochIndex,
                idHash,
                leftNode:
                    "0xe4b843f41c3228fdff3c9db457d895ba444be689f42d58902e56b3eb5b05c6d1",
                otherParent:
                    "0x96e1b82f2632d0b5ce9d406f26db76a3e9a7aef1cff0c29ffcbd3d193c508919",
                tournamentAddress,
                txHash: "0x7adac1a62f3e5fd04f096f7c6fb233a6e8dd2a96bcc3463e16ff2927431d623a",
                updatedAt: new Date(now - 345),
            },
            {
                blockNumber: 5n,
                createdAt: new Date(now - 28),
                epochIndex,
                idHash,
                leftNode:
                    "0x27224e3bfb947cd11ec0432ca19ecf6590f6b81973a0d4e4f147ebca84767112",
                otherParent:
                    "0xe4b843f41c3228fdff3c9db457d895ba444be689f42d58902e56b3eb5b05c6d1",
                tournamentAddress,
                txHash: "0xb8df76d2cfad6edbea139ea38afce747fff297fa8172ff33d0facfdb07319aaf",
                updatedAt: new Date(now - 28),
            },
        ],
        match: {
            blockNumber: 1n,
            commitmentOne: claim(0).hash,
            commitmentTwo: claim(1).hash,
            createdAt: new Date(now),
            deletionBlockNumber: null,
            deletionReason: "NOT_DELETED",
            deletionTxHash: null,
            epochIndex,
            idHash,
            leftOfTwo,
            tournamentAddress,
            txHash: "0x06ad8f0ce427010498fbb2388b432f6d578e4e1ffe5dbf20869629b09dcf0d70",
            updatedAt: new Date(now),
            winnerCommitment: "NONE",
        },
        height: 48n,
        now,
        nextLevel: 1n,
    },
};

/**
 * A match where first claimer has not taken action, and the second claimer has claimed victory.
 */
export const Timeout: Story = {
    args: {
        advances: [],
        match: {
            blockNumber: 1n,
            commitmentOne: claim(0).hash,
            commitmentTwo: claim(1).hash,
            createdAt: new Date(now),
            deletionBlockNumber: 2n,
            deletionReason: "TIMEOUT",
            deletionTxHash:
                "0x06ad8f0ce427010498fbb2388b432f6d578e4e1ffe5dbf20869629b09dcf0d70",
            epochIndex,
            idHash,
            leftOfTwo,
            tournamentAddress,
            txHash: "0x06ad8f0ce427010498fbb2388b432f6d578e4e1ffe5dbf20869629b09dcf0d70",
            updatedAt: new Date(now - 1000),
            winnerCommitment: "TWO",
        },
        height: 48n,
        now,
        nextLevel: 1n,
    },
};

/**
 * A match where first claimer has advanced, second claimer has not taken action, and then first claimer has claimed victory..
 */
export const TimeoutSecond: Story = {
    args: {
        advances: [
            {
                blockNumber: 1n,
                createdAt: new Date(now - 3453),
                epochIndex: 0n,
                idHash,
                leftNode:
                    "0xc2a1e4406e117170e1539376ae0b2bf8a8ba65dd241ac4cc6a19efb376041f54",
                otherParent:
                    "0x7b39d1c90850f72daa51599ec1ff041aa5b1eda8f6ef1d00ce853b8f89462002",
                tournamentAddress,
                txHash: "0x7b39d1c90850f72daa51599ec1ff041aa5b1eda8f6ef1d00ce853b8f89462002",
                updatedAt: new Date(now - 3453),
            },
        ],
        match: {
            blockNumber: 2n,
            commitmentOne: claim(0).hash,
            commitmentTwo: claim(1).hash,
            createdAt: new Date(now),
            deletionBlockNumber: 2n,
            deletionReason: "TIMEOUT",
            deletionTxHash:
                "0x06ad8f0ce427010498fbb2388b432f6d578e4e1ffe5dbf20869629b09dcf0d70",
            epochIndex,
            idHash,
            leftOfTwo,
            tournamentAddress,
            txHash: "0x06ad8f0ce427010498fbb2388b432f6d578e4e1ffe5dbf20869629b09dcf0d70",
            updatedAt: new Date(now - 1000),
            winnerCommitment: "ONE",
        },
        height: 48n,
        now,
        nextLevel: 1n,
    },
};

/**
 * A match that has been eliminated by timeout with no action from both claimers.
 */
export const Elimination: Story = {
    args: {
        advances: [],
        match: {
            blockNumber: 1n,
            commitmentOne: claim(0).hash,
            commitmentTwo: claim(1).hash,
            createdAt: new Date(now),
            deletionBlockNumber: 2n,
            deletionReason: "TIMEOUT",
            deletionTxHash:
                "0x06ad8f0ce427010498fbb2388b432f6d578e4e1ffe5dbf20869629b09dcf0d70",
            epochIndex,
            idHash,
            leftOfTwo,
            tournamentAddress,
            txHash: "0x06ad8f0ce427010498fbb2388b432f6d578e4e1ffe5dbf20869629b09dcf0d70",
            updatedAt: new Date(now - 1000),
            winnerCommitment: "NONE",
        },
        height: 48n,
        now,
        nextLevel: 1n,
    },
};

/**
 * A match that has been eliminated by timeout with no action from both claimers after a few bisections.
 */
export const EliminationAfterBisections: Story = {
    args: {
        advances: randomAdvances({
            count: 3,
            epochIndex,
            idHash,
            leftOfTwo,
            now: now - 7966,
            tournamentAddress,
        }),
        match: {
            blockNumber: 1n,
            commitmentOne: claim(0).hash,
            commitmentTwo: claim(1).hash,
            createdAt: new Date(now),
            deletionBlockNumber: 2n,
            deletionReason: "TIMEOUT",
            deletionTxHash:
                "0x06ad8f0ce427010498fbb2388b432f6d578e4e1ffe5dbf20869629b09dcf0d70",
            epochIndex,
            idHash,
            leftOfTwo,
            tournamentAddress,
            txHash: "0x06ad8f0ce427010498fbb2388b432f6d578e4e1ffe5dbf20869629b09dcf0d70",
            updatedAt: new Date(now - 1000),
            winnerCommitment: "NONE",
        },
        height: 48n,
        now,
        nextLevel: 1n,
    },
};

/**
 * A match that has reached the leaf level and will go to a sub-tournament.
 */
export const SubTournament: Story = {
    args: {
        advances: randomAdvances({
            count: 4,
            epochIndex,
            idHash,
            leftOfTwo,
            now: now - 7966,
            tournamentAddress,
        }),
        match: {
            blockNumber: 1n,
            commitmentOne: claim(0).hash,
            commitmentTwo: claim(1).hash,
            createdAt: new Date(now),
            deletionBlockNumber: 2n,
            deletionReason: "CHILD_TOURNAMENT",
            deletionTxHash:
                "0x06ad8f0ce427010498fbb2388b432f6d578e4e1ffe5dbf20869629b09dcf0d70",
            epochIndex,
            idHash,
            leftOfTwo,
            tournamentAddress,
            txHash: "0x06ad8f0ce427010498fbb2388b432f6d578e4e1ffe5dbf20869629b09dcf0d70",
            updatedAt: new Date(now - 1000),
            winnerCommitment: "NONE",
        },
        height: 5n,
        now,
        nextLevel: 1n,
    },
};

/**
 * A bottom match that has reached the leaf level and has a winner.
 */
export const WinnerBottom: Story = {
    args: {
        advances: randomAdvances({
            count: 4,
            epochIndex,
            idHash,
            leftOfTwo,
            now: now - 7966,
            tournamentAddress,
        }),
        match: {
            blockNumber: 1n,
            commitmentOne: claim(0).hash,
            commitmentTwo: claim(1).hash,
            createdAt: new Date(now),
            deletionBlockNumber: 2n,
            deletionReason: "STEP",
            deletionTxHash:
                "0x06ad8f0ce427010498fbb2388b432f6d578e4e1ffe5dbf20869629b09dcf0d70",
            epochIndex,
            idHash,
            leftOfTwo,
            tournamentAddress,
            txHash: "0x06ad8f0ce427010498fbb2388b432f6d578e4e1ffe5dbf20869629b09dcf0d70",
            updatedAt: new Date(now - 1000),
            winnerCommitment: "ONE",
        },
        height: 5n,
        now,
        nextLevel: 3n,
    },
};

/**
 * A top match that has reached the leaf level and the middle level has a winner.
 */
export const WinnerTop: Story = {
    args: {
        advances: randomAdvances({
            count: 4,
            epochIndex,
            idHash,
            leftOfTwo,
            now: now - 7966,
            tournamentAddress,
        }),
        match: {
            blockNumber: 1n,
            commitmentOne: claim(0).hash,
            commitmentTwo: claim(1).hash,
            createdAt: new Date(now),
            deletionBlockNumber: 2n,
            deletionReason: "CHILD_TOURNAMENT",
            deletionTxHash:
                "0x06ad8f0ce427010498fbb2388b432f6d578e4e1ffe5dbf20869629b09dcf0d70",
            epochIndex,
            idHash,
            leftOfTwo,
            tournamentAddress,
            txHash: "0x06ad8f0ce427010498fbb2388b432f6d578e4e1ffe5dbf20869629b09dcf0d70",
            updatedAt: new Date(now - 1000),
            winnerCommitment: "ONE",
        },
        height: 5n,
        now,
        nextLevel: 1n,
    },
};

/**
 * A match that no claimer has taken action yet.
 */
export const NoActions: Story = {
    args: {
        advances: [],
        match: {
            blockNumber: 1n,
            commitmentOne: claim(0).hash,
            commitmentTwo: claim(1).hash,
            createdAt: new Date(now),
            deletionBlockNumber: null,
            deletionReason: "NOT_DELETED",
            deletionTxHash: null,
            epochIndex: 0n,
            idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
            leftOfTwo:
                "0x7b39d1c90850f72daa51599ec1ff041aa5b1eda8f6ef1d00ce853b8f89462002",
            tournamentAddress,
            txHash: "0x06ad8f0ce427010498fbb2388b432f6d578e4e1ffe5dbf20869629b09dcf0d70",
            updatedAt: new Date(now),
            winnerCommitment: "NONE",
        },
        height: 48n,
        now,
        nextLevel: 1n,
    },
};
