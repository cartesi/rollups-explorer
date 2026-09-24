import type { Meta, StoryObj } from "@storybook/nextjs";
import { keccak256, toHex, zeroHash } from "viem";
import { createTournamentSnapshot } from "../../stories/prt";
import { TournamentOutcome } from "./TournamentOutcome";

const meta = {
    title: "Components/Tournament/TournamentOutcome",
    component: TournamentOutcome,
    tags: ["autodocs"],
} satisfies Meta<typeof TournamentOutcome>;

export default meta;
type Story = StoryObj<typeof meta>;

const commitment = keccak256(toHex(1));
const finalStateHash = keccak256(toHex("final-state"));

export const MatchesActive: Story = {
    args: { snapshot: createTournamentSnapshot({ asOfBlock: 1200n }) },
};

export const AwaitingClosureWithCandidate: Story = {
    args: {
        snapshot: createTournamentSnapshot({
            standing: "AWAITING_CLOSURE",
            candidate: commitment,
            asOfBlock: 1200n,
        }),
    },
};

export const RootWinner: Story = {
    args: {
        snapshot: createTournamentSnapshot({
            standing: "ROOT_WINNER",
            candidate: commitment,
            winnerCommitment: commitment,
            finalStateHash,
            finishedAtBlock: 1180n,
            asOfBlock: 1200n,
        }),
    },
};

export const RootWithoutWinner: Story = {
    args: {
        snapshot: createTournamentSnapshot({
            standing: "ROOT_FAILED",
            finishedAtBlock: 1180n,
            asOfBlock: 1200n,
        }),
    },
};

export const ProvisionalInnerWinner: Story = {
    args: {
        snapshot: createTournamentSnapshot({
            standing: "INNER_WINNER",
            candidate: commitment,
            winnerCommitment: commitment,
            finalStateHash: zeroHash,
            finishedAtBlock: 1180n,
            winnerExpiresAt: 1260n,
            asOfBlock: 1200n,
        }),
    },
};

export const InnerWithoutWinner: Story = {
    args: {
        snapshot: createTournamentSnapshot({
            standing: "INNER_ELIMINABLE_NO_WINNER",
            finishedAtBlock: 1180n,
            asOfBlock: 1200n,
        }),
    },
};

export const InnerWinnerExpired: Story = {
    args: {
        snapshot: createTournamentSnapshot({
            standing: "INNER_ELIMINABLE_WINNER_EXPIRED",
            candidate: commitment,
            finishedAtBlock: 1180n,
            asOfBlock: 1300n,
        }),
    },
};
