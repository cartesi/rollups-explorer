import type { Meta, StoryObj } from "@storybook/nextjs";
import { keccak256, toHex } from "viem";
import {
    createMatch,
    createMatchSnapshot,
    createTournament,
} from "../../stories/prt";
import { InnerTournamentAction } from "./InnerTournamentAction";

const meta = {
    title: "Components/Tournament/InnerTournamentAction",
    component: InnerTournamentAction,
    tags: ["autodocs"],
    parameters: { connectionType: "system" },
} satisfies Meta<typeof InnerTournamentAction>;

export default meta;
type Story = StoryObj<typeof meta>;

const parentMatch = createMatch({
    snapshot: createMatchSnapshot({
        phase: "SEALED",
        bisection: null,
        sealed: {
            agreeState: keccak256(toHex("agree")),
            divergencePosition: 1024n,
            divergenceCycle: 1024n << 44n,
            finalStateOne: keccak256(toHex("one")),
            finalStateTwo: keccak256(toHex("two")),
        },
    }),
});

const child = (
    disposition: "WINNER" | "ELIMINABLE",
    standing: "INNER_WINNER" | "INNER_ELIMINABLE_NO_WINNER",
) =>
    createTournament({
        address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        level: 1n,
        log2step: 27n,
        height: 17n,
        baseCycle: 1024n << 44n,
        parentTournamentAddress: parentMatch.tournamentAddress,
        parentMatchIdHash: parentMatch.idHash,
        snapshot: {
            asOfBlock: 100n,
            standing,
            finishedAtBlock: 90n,
            winnerExpiresAt: disposition === "WINNER" ? 180n : 0n,
            innerResult: {
                disposition,
                parentCommitment:
                    disposition === "WINNER" ? parentMatch.commitmentOne : null,
                pausedAllowance: disposition === "WINNER" ? 500n : 0n,
            },
        },
    });

/**
 * The inner tournament has a live winner: anyone can propagate it to the
 * parent before it expires at block 180.
 */
export const Win: Story = {
    args: {
        child: child("WINNER", "INNER_WINNER"),
        parentMatch,
        winnerChildren: [keccak256(toHex("left")), keccak256(toHex("right"))],
    },
};

/**
 * The winner joined the parent tournament through another contract, so its
 * root children cannot be read.
 */
export const WinRelayedJoin: Story = {
    args: { ...Win.args, winnerChildren: undefined },
};

/**
 * The winner's join in the parent tournament is still being read.
 */
export const WinLoading: Story = {
    args: {
        ...Win.args,
        winnerChildren: undefined,
        winnerChildrenLoading: true,
    },
};

/**
 * The inner tournament finished without a winner, so anyone can close the
 * parent match.
 */
export const Eliminate: Story = {
    args: {
        child: child("ELIMINABLE", "INNER_ELIMINABLE_NO_WINNER"),
        parentMatch,
    },
};

/**
 * The mocked connection hides the action.
 */
export const Hidden: Story = {
    parameters: { connectionType: "system_mock" },
    args: Eliminate.args,
};
