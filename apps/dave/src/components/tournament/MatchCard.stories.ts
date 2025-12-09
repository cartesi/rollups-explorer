import type { Match } from "@cartesi/viem";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { fn } from "storybook/test";
import { claim, generateMatchID } from "../../stories/util";
import { MatchCard } from "./MatchCard";

const meta = {
    title: "Components/Tournament/MatchCard",
    component: MatchCard,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof MatchCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const timestamp = Math.floor(Date.now() / 1000);

const match: Match = {
    blockNumber: 1n,
    commitmentOne: claim(0).hash,
    commitmentTwo: claim(1).hash,
    createdAt: new Date(timestamp),
    deletionBlockNumber: null,
    deletionReason: "NOT_DELETED",
    deletionTxHash: null,
    epochIndex: 0n,
    idHash: generateMatchID(claim(0).hash, claim(1).hash),
    leftOfTwo:
        "0x7b39d1c90850f72daa51599ec1ff041aa5b1eda8f6ef1d00ce853b8f89462002",
    tournamentAddress: "0x61bcab9d0d8b554009824292d2d6855dfa3aab86",
    txHash: "0x06ad8f0ce427010498fbb2388b432f6d578e4e1ffe5dbf20869629b09dcf0d70",
    updatedAt: new Date(timestamp),
    winnerCommitment: "NONE",
};
/**
 * A match that is ongoing, which means that both claims are still in dispute, with no winner yet.
 */
export const Ongoing: Story = {
    args: {
        match,
        onClick: fn(),
    },
};

/**
 * A match of a mid-level tournament, where claims have parent claims.
 * XXX: not implemented yet
 */
export const MidLevel: Story = {
    args: {
        match: {
            ...match,
            commitmentOne: claim(0, 2).hash,
            commitmentTwo: claim(1, 3).hash,
        },
        onClick: fn(),
    },
};

/**
 * A match of a bottom-level tournament, where claims have parent claims.
 * XXX: not implemented yet
 */
export const BottomLevel: Story = {
    args: {
        match: {
            ...match,
            commitmentOne: claim(0, 2, 4).hash,
            commitmentTwo: claim(1, 3, 5).hash,
        },
        onClick: fn(),
    },
};

/**
 * A match that the first claim is the winner.
 */
export const Winner1: Story = {
    args: {
        match: {
            ...match,
            winnerCommitment: "ONE",
        },
        onClick: fn(),
    },
};

/**
 * A match that the second claim is the winner.
 */
export const Winner2: Story = {
    args: {
        match: {
            ...match,
            winnerCommitment: "TWO",
        },
        onClick: fn(),
    },
};

/**
 * A match without a onClick event handler, which should change the cursor feedback.
 */
export const NoClickEventHandler: Story = {
    args: {
        match,
    },
};
