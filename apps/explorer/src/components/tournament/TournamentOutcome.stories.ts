import type { Meta, StoryObj } from "@storybook/nextjs";
import { keccak256, toHex } from "viem";
import { createMatch, createTournament } from "../../stories/prt";
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
    args: { tournament: createTournament({ snapshot: { asOfBlock: 1200n } }) },
};

export const AwaitingClosureWithCandidate: Story = {
    args: {
        tournament: createTournament({
            snapshot: {
                standing: "AWAITING_CLOSURE",
                candidate: commitment,
                asOfBlock: 1200n,
            },
        }),
    },
};

export const RootWinner: Story = {
    args: {
        tournament: createTournament({
            snapshot: {
                standing: "ROOT_WINNER",
                candidate: commitment,
                winnerCommitment: commitment,
                finalStateHash,
                finishedAtBlock: 1180n,
                asOfBlock: 1200n,
            },
        }),
    },
};

export const RootWithoutWinner: Story = {
    args: {
        tournament: createTournament({
            snapshot: {
                standing: "ROOT_FAILED",
                finishedAtBlock: 1180n,
                asOfBlock: 1200n,
            },
        }),
    },
};

const parentMatch = createMatch({
    commitmentOne: keccak256(toHex("parent-one")),
    commitmentTwo: keccak256(toHex("parent-two")),
});
const contested = {
    contestedFinalStateOne: keccak256(toHex("state-one")),
    contestedFinalStateTwo: keccak256(toHex("state-two")),
};

/**
 * An inner tournament still running: the two contested states of its parent
 * match, each with the parent commitment claiming it.
 */
export const InnerPending: Story = {
    args: {
        parentMatch,
        tournament: createTournament({
            level: 1n,
            ...contested,
            snapshot: {
                standing: "AWAITING_CLOSURE",
                candidate: commitment,
                asOfBlock: 1200n,
            },
        }),
    },
};

/**
 * The inner winner's final state equals the first contested state, so it
 * defends the parent's first commitment.
 */
export const ProvisionalInnerWinner: Story = {
    args: {
        parentMatch,
        tournament: createTournament({
            level: 1n,
            ...contested,
            snapshot: {
                standing: "INNER_WINNER",
                candidate: commitment,
                winnerCommitment: commitment,
                finalStateHash: contested.contestedFinalStateOne,
                finishedAtBlock: 1180n,
                winnerExpiresAt: 1260n,
                asOfBlock: 1200n,
            },
        }),
    },
};

/**
 * The parent match is not loaded yet: the contested states stand alone.
 */
export const InnerWithoutParentMatch: Story = {
    args: {
        tournament: ProvisionalInnerWinner.args.tournament,
    },
};

export const InnerWithoutWinner: Story = {
    args: {
        parentMatch,
        tournament: createTournament({
            level: 1n,
            ...contested,
            snapshot: {
                standing: "INNER_ELIMINABLE_NO_WINNER",
                finishedAtBlock: 1180n,
                asOfBlock: 1200n,
            },
        }),
    },
};

export const InnerWinnerExpired: Story = {
    args: {
        parentMatch,
        tournament: createTournament({
            level: 1n,
            ...contested,
            snapshot: {
                standing: "INNER_ELIMINABLE_WINNER_EXPIRED",
                candidate: commitment,
                finishedAtBlock: 1180n,
                asOfBlock: 1300n,
            },
        }),
    },
};
