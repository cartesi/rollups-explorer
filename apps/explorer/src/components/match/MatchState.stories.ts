import type { MatchSnapshot } from "@cartesi/client";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { keccak256, toHex, zeroAddress } from "viem";
import { randomAdvances } from "../../stories/data";
import {
    createCommitment,
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

export const TimeoutOneWins: Story = {
    args: {
        tournament,
        match: {
            ...match,
            snapshot: bisecting({ timeoutOutcome: "ONE_WINS" }),
        },
        commitments: clocks,
    },
};

export const TimeoutTwoWins: Story = {
    args: {
        tournament,
        match: {
            ...match,
            snapshot: bisecting({ timeoutOutcome: "TWO_WINS" }, "ONE"),
        },
    },
};

export const EliminateBoth: Story = {
    args: {
        tournament,
        match: {
            ...match,
            snapshot: bisecting({ timeoutOutcome: "ELIMINATE_BOTH" }),
        },
    },
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
