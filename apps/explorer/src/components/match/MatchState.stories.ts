import type { MatchSnapshot } from "@cartesi/client";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { keccak256, toHex, zeroAddress } from "viem";
import { randomAdvances } from "../../stories/data";
import {
    createCommitment,
    createJoinBond,
    createMatch,
    createMatchSnapshot,
    createMatchState,
    createTournament,
} from "../../stories/prt";
import { MatchState } from "./MatchState";

const meta = {
    title: "Components/Match/MatchState",
    component: MatchState,
    tags: ["autodocs"],
} satisfies Meta<typeof MatchState>;

export default meta;
type Story = StoryObj<typeof meta>;

const tournament = createTournament({ height: 48n, log2step: 44n });
const match = createMatch({ tournamentAddress: tournament.address });

const advances = (count: number) =>
    randomAdvances({ count, now: 0, tournamentAddress: tournament.address });

const bisecting = (
    overrides: Partial<
        Pick<MatchSnapshot, "timeoutOutcome" | "deferredCharge">
    > = {},
    responder: "ONE" | "TWO" = "TWO",
) =>
    createMatchState({
        tournament,
        advances: advances(responder === "TWO" ? 31 : 30),
        asOfBlock: 1200n,
        ...overrides,
    });

const clocks = [
    createCommitment({
        commitment: match.commitmentOne,
        snapshot: { asOfBlock: 1200n, clockAllowance: 320n },
    }),
    createCommitment({
        commitment: match.commitmentTwo,
        snapshot: {
            asOfBlock: 1200n,
            clockRunning: true,
            clockDeadline: 1250n,
        },
    }),
];

export const NotStarted: Story = {
    args: {
        tournament,
        match: {
            ...match,
            snapshot: createMatchSnapshot({ asOfBlock: 1200n }),
        },
    },
};

export const Bisecting: Story = {
    args: {
        tournament,
        match: { ...match, snapshot: bisecting() },
        commitments: clocks,
    },
};

export const ReadyToSeal: Story = {
    args: {
        tournament,
        match: {
            ...match,
            snapshot: createMatchState({
                tournament,
                advances: advances(47),
                asOfBlock: 1200n,
            }),
        },
        commitments: clocks,
    },
};

export const Sealed: Story = {
    args: {
        tournament,
        match: {
            ...match,
            snapshot: createMatchState({
                tournament,
                advances: advances(47),
                asOfBlock: 1200n,
                sealed: {},
            }),
        },
    },
};

export const LeafSealed: Story = {
    args: {
        ...Sealed.args,
        match: {
            ...Sealed.args.match,
            leafSeal: {
                eliminableAt: 1400n,
                blockNumber: 1190n,
                txHash: keccak256(toHex("seal")),
                logIndex: 2n,
            },
        },
    },
};

const children = (side: string) =>
    [
        keccak256(toHex(`${side}-left`)),
        keccak256(toHex(`${side}-right`)),
    ] as const;

const joinBonds = new Map(
    clocks.map((commitment, index) => [
        commitment.commitment,
        createJoinBond(commitment, { children: children(`${index}`) }),
    ]),
);

const timeoutClocks = (expired: "ONE" | "TWO", deadline: bigint) =>
    [match.commitmentOne, match.commitmentTwo].map((commitment, index) =>
        createCommitment({
            commitment,
            snapshot:
                (index === 0) === (expired === "ONE")
                    ? {
                          asOfBlock: 1200n,
                          clockRunning: true,
                          clockDeadline: deadline,
                      }
                    : { asOfBlock: 1200n, clockAllowance: 320n },
        }),
    );

/**
 * Commitment two's deadline passed 20 blocks ago. Anyone can claim the win
 * for commitment one, charged those 20 blocks, before its own 320 run out.
 */
export const TimeoutOneWins: Story = {
    parameters: { connectionType: "system" },
    args: {
        tournament,
        match: {
            ...match,
            snapshot: bisecting({
                timeoutOutcome: "ONE_WINS",
                deferredCharge: 20n,
            }),
        },
        commitments: timeoutClocks("TWO", 1180n),
        joinBonds,
    },
};

/**
 * Commitment one's deadline passed, and the win goes to commitment two.
 */
export const TimeoutTwoWins: Story = {
    parameters: { connectionType: "system" },
    args: {
        tournament,
        match: {
            ...match,
            snapshot: bisecting(
                { timeoutOutcome: "TWO_WINS", deferredCharge: 20n },
                "ONE",
            ),
        },
        commitments: timeoutClocks("ONE", 1180n),
        joinBonds,
    },
};

/**
 * Commitment two is 400 blocks overdue, more than commitment one's 320 left,
 * so neither can survive and anyone can eliminate both.
 */
export const EliminateBoth: Story = {
    parameters: { connectionType: "system" },
    args: {
        tournament,
        match: {
            ...match,
            snapshot: bisecting({ timeoutOutcome: "ELIMINATE_BOTH" }),
        },
        commitments: timeoutClocks("TWO", 800n),
    },
};

/**
 * The winner joined through another contract, so the win cannot be sent from
 * the explorer.
 */
export const TimeoutWinRelayedJoin: Story = {
    ...TimeoutOneWins,
    args: { ...TimeoutOneWins.args, joinBonds: undefined },
};

export const DeferredCharge: Story = {
    args: {
        tournament,
        match: { ...match, snapshot: bisecting({ deferredCharge: 12n }) },
    },
};

export const InactiveCommitment: Story = {
    args: {
        tournament,
        match: { ...match, snapshot: bisecting() },
        commitments: [
            clocks[0],
            createCommitment({
                commitment: match.commitmentTwo,
                snapshot: { claimer: zeroAddress },
            }),
        ],
    },
};

export const Closed: Story = {
    args: {
        tournament,
        match: {
            ...match,
            deletionReason: "TIMEOUT",
            winnerCommitment: "ONE",
            deletionBlockNumber: 1100n,
            deletionTxHash: keccak256(toHex("deletion")),
            snapshot: createMatchSnapshot({ asOfBlock: 1100n }),
        },
        commitments: clocks,
    },
};
