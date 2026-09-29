import type { Meta, StoryObj } from "@storybook/nextjs";
import { createElement } from "react";
import * as TournamentStories from "../tournament/TournamentView.stories";
import { randomAdvances } from "../../stories/data";
import {
    createCommitment,
    createJoinBond,
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

const depositorOne = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const depositorTwo = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
const otherAccount = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
const joinedCommitments = [
    createCommitment({
        commitment: match.commitmentOne,
        submitterAddress: depositorOne,
        txHash: "0x3f1a2b8c9d0e4f5a6b7c8d9e0f1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c",
    }),
    createCommitment({
        commitment: match.commitmentTwo,
        submitterAddress: depositorTwo,
        txHash: "0x9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d",
    }),
];

/**
 * Each claim's depositor, and gas refunds for moves sent by the depositors
 * and by an account that deposited neither bond. The second claim joined
 * through another contract, so only its minimum bond is known.
 */
export const WithJoinBonds: Story = {
    args: {
        ...Ongoing.args,
        commitments: joinedCommitments,
        joinBonds: new Map([
            [
                match.commitmentOne,
                createJoinBond(joinedCommitments[0], {
                    value: 25_000_000_000_000_000n,
                }),
            ],
            [
                match.commitmentTwo,
                createJoinBond(joinedCommitments[1], { exact: false }),
            ],
        ]),
        refunds: createRefunds(
            Ongoing.args.advances.map(({ txHash }) => txHash),
            0,
            [depositorOne, depositorTwo, otherAccount],
        ),
    },
};

/**
 * The depositors show while the bond amounts load.
 */
export const JoinBondsLoading: Story = {
    args: {
        ...WithJoinBonds.args,
        joinBonds: new Map(),
        joinBondsLoading: true,
    },
};
