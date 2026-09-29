import type { Meta, StoryObj } from "@storybook/nextjs";
import { createElement } from "react";
import * as TournamentStories from "../tournament/TournamentView.stories";
import { randomAdvances } from "../../stories/data";
import {
    createCommitment,
    createMatchState,
    createRefunds,
} from "../../stories/prt";
import * as MatchActionsStories from "./MatchActions.stories";
import { MatchView } from "./MatchView";
import { toBlockTimestamps } from "../../stories/util";

const meta = {
    title: "Components/Match/MatchView",
    component: MatchView,
    render: (args) =>
        createElement(MatchView, {
            ...args,
            timestamps:
                args.timestamps ??
                toBlockTimestamps(
                    args.advances,
                    args.match,
                    args.subTournament,
                ),
        }),
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

/**
 * Block timestamps are still loading, so each time shows a skeleton.
 */
export const TimestampsLoading: Story = {
    args: {
        ...Ongoing.args,
        timestamps: new Map(),
        timestampsLoading: true,
    },
};

/**
 * Block timestamps could not be resolved, so the timeline keeps only the
 * bisection counters, without an empty time cell.
 */
export const TimestampsUnavailable: Story = {
    args: {
        ...Ongoing.args,
        timestamps: new Map(),
        timestampsLoading: false,
    },
};

/**
 * Gas refunds paid for the advances of the match.
 */
export const WithRefunds: Story = {
    args: {
        ...Ongoing.args,
        refunds: createRefunds(
            Ongoing.args.advances.map(({ txHash }) => txHash),
            3,
        ),
    },
};
