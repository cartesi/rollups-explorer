import type { Meta, StoryObj } from "@storybook/nextjs";
import * as TournamentStories from "../tournament/TournamentView.stories";
import { randomAdvances } from "../../stories/data";
import { createCommitment, createMatchState } from "../../stories/prt";
import * as MatchActionsStories from "./MatchActions.stories";
import { MatchView } from "./MatchView";

const meta = {
    title: "Components/Match/MatchView",
    component: MatchView,
} satisfies Meta<typeof MatchView>;

export default meta;
type Story = StoryObj<typeof meta>;

const now = Date.now();
const tournament = TournamentStories.Ongoing.args.tournament;
const match = TournamentStories.Ongoing.args.matches[1];
const advances = MatchActionsStories.Bisections.args.advances;

export const Ongoing: Story = {
    args: {
        tournament,
        match: {
            ...match,
            snapshot: createMatchState({ tournament, advances }),
        },
        advances,
        now,
    },
};

/**
 * A match that no claimer has taken action yet.
 */
export const NoActions: Story = {
    args: {
        tournament,
        match,
        advances: [],
        now,
    },
};

/**
 * Commitment two ran out of time and commitment one can claim the win.
 */
export const TimeoutPending: Story = {
    args: {
        ...Ongoing.args,
        match: {
            ...match,
            snapshot: createMatchState({
                tournament,
                advances,
                asOfBlock: 1200n,
                timeoutOutcome: "ONE_WINS",
            }),
        },
        commitments: [
            createCommitment({
                commitment: match.commitmentOne,
                snapshot: { asOfBlock: 1200n, clockAllowance: 320n },
            }),
            createCommitment({
                commitment: match.commitmentTwo,
                snapshot: {
                    asOfBlock: 1200n,
                    clockRunning: true,
                    clockDeadline: 1180n,
                },
            }),
        ],
    },
};

const sealedAdvances = randomAdvances({
    count: 47,
    now: now - 7966,
    tournamentAddress: tournament.address,
});

/**
 * Both commitments agreed on a state and diverged on the next one.
 */
export const Sealed: Story = {
    args: {
        ...Ongoing.args,
        advances: sealedAdvances,
        match: {
            ...match,
            snapshot: createMatchState({
                tournament,
                advances: sealedAdvances,
                sealed: {},
            }),
        },
    },
};
