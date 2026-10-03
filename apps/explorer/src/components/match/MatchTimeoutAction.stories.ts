import type { Meta, StoryObj } from "@storybook/nextjs";
import { keccak256, toHex } from "viem";
import { createMatch, createMatchSnapshot } from "../../stories/prt";
import { MatchTimeoutAction } from "./MatchTimeoutAction";

const meta = {
    title: "Components/Match/MatchTimeoutAction",
    component: MatchTimeoutAction,
    tags: ["autodocs"],
    parameters: { connectionType: "system" },
} satisfies Meta<typeof MatchTimeoutAction>;

export default meta;
type Story = StoryObj<typeof meta>;

const tournamentAddress = "0xA2835312696Afa86c969e40831857dbB1412627f";
const winnerChildren = [
    keccak256(toHex("left")),
    keccak256(toHex("right")),
] as const;

const withOutcome = (
    timeoutOutcome: "ONE_WINS" | "TWO_WINS" | "ELIMINATE_BOTH",
) =>
    createMatch({
        snapshot: createMatchSnapshot({
            asOfBlock: 1200n,
            timeoutOutcome,
            deferredCharge: timeoutOutcome === "ELIMINATE_BOTH" ? 0n : 20n,
        }),
    });

/**
 * Commitment two's clock ran out: anyone can claim the win for commitment
 * one before its own allowance is used up by the deferred charge.
 */
export const WinOne: Story = {
    args: {
        match: withOutcome("ONE_WINS"),
        tournamentAddress,
        winnerChildren,
        expiresIn: 300n,
    },
};

/**
 * Commitment one's clock ran out, and the win goes to commitment two.
 */
export const WinTwo: Story = {
    args: { ...WinOne.args, match: withOutcome("TWO_WINS"), expiresIn: 12n },
};

/**
 * The winner joined through another contract, so its root children cannot
 * be read and the win cannot be sent from here.
 */
export const WinRelayedJoin: Story = {
    args: { ...WinOne.args, winnerChildren: undefined },
};

/**
 * The winner's join is still being read.
 */
export const WinLoading: Story = {
    args: {
        ...WinOne.args,
        winnerChildren: undefined,
        winnerChildrenLoading: true,
    },
};

/**
 * Both clocks ran out, so anyone can eliminate both claims.
 */
export const Eliminate: Story = {
    args: { match: withOutcome("ELIMINATE_BOTH"), tournamentAddress },
};

/**
 * The mocked connection hides the action.
 */
export const Hidden: Story = {
    parameters: { connectionType: "system_mock" },
    args: Eliminate.args,
};
