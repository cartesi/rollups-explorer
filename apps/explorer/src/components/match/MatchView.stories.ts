import type { Meta, StoryObj } from "@storybook/nextjs";
import { createElement } from "react";
import * as TournamentStories from "../tournament/TournamentView.stories";
import { keccak256, toHex } from "viem";
import { randomAdvances } from "../../stories/data";
import {
    createCommitment,
    createJoinBond,
    createMatchState,
    createRefunds,
    createTournament,
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

const timeoutCommitments = [
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
];

/**
 * Commitment two ran out of time 20 blocks ago, and anyone can claim the win
 * for commitment one before its own 320 blocks are used up.
 */
export const TimeoutPending: Story = {
    parameters: { connectionType: "system" },
    args: {
        ...Ongoing.args,
        match: {
            ...match,
            snapshot: createMatchState({
                tournament,
                advances,
                asOfBlock: 1200n,
                timeoutOutcome: "ONE_WINS",
                deferredCharge: 20n,
            }),
        },
        commitments: timeoutCommitments,
        joinBonds: new Map([
            [
                match.commitmentOne,
                createJoinBond(timeoutCommitments[0], {
                    children: [
                        keccak256(toHex("one-left")),
                        keccak256(toHex("one-right")),
                    ],
                }),
            ],
        ]),
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

export const BondsTab: Story = {
    args: { ...WithJoinBonds.args, tab: "bonds" },
};

/**
 * The depositors show while the bond amounts load.
 */
export const JoinBondsLoading: Story = {
    args: {
        ...BondsTab.args,
        joinBonds: new Map(),
        joinBondsLoading: true,
    },
};

const sealedMatch = Sealed.args.match;
const divergence =
    sealedMatch.snapshot.phase === "SEALED"
        ? sealedMatch.snapshot.sealed.divergencePosition
        : 0n;

const innerTournament = (
    disposition: "WINNER" | "ELIMINABLE",
    standing: "INNER_WINNER" | "INNER_ELIMINABLE_NO_WINNER",
) =>
    createTournament({
        address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        level: 1n,
        log2step: 27n,
        height: 17n,
        baseCycle: tournament.baseCycle + (divergence << tournament.log2step),
        parentTournamentAddress: tournament.address,
        parentMatchIdHash: sealedMatch.idHash,
        startInstant: 60n,
        snapshot: {
            asOfBlock: 100n,
            standing,
            finishedAtBlock: 90n,
            winnerExpiresAt: disposition === "WINNER" ? 180n : 0n,
            innerResult: {
                disposition,
                parentCommitment:
                    disposition === "WINNER" ? sealedMatch.commitmentOne : null,
                pausedAllowance: disposition === "WINNER" ? 500n : 0n,
            },
        },
    });

/**
 * The sealed match's sub-tournament has a live winner, and anyone can
 * propagate it to this match from its timeline.
 */
export const SubTournamentWinner: Story = {
    parameters: { connectionType: "system" },
    args: {
        ...Sealed.args,
        subTournament: innerTournament("WINNER", "INNER_WINNER"),
        commitments: joinedCommitments,
        joinBonds: new Map([
            [
                sealedMatch.commitmentOne,
                createJoinBond(joinedCommitments[0], {
                    children: [
                        keccak256(toHex("one-left")),
                        keccak256(toHex("one-right")),
                    ],
                }),
            ],
        ]),
    },
};

/**
 * The sub-tournament finished without a winner, so anyone can close this
 * match.
 */
export const SubTournamentEliminable: Story = {
    parameters: { connectionType: "system" },
    args: {
        ...Sealed.args,
        subTournament: innerTournament(
            "ELIMINABLE",
            "INNER_ELIMINABLE_NO_WINNER",
        ),
    },
};
