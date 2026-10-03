import type { Meta, StoryObj } from "@storybook/nextjs";
import type { BondRecoveredEvent } from "../../lib/bondUtils";
import { createBondEvent } from "../../stories/prt";
import { BondRecoveryDetails } from "./BondRecoveryDetails";

const meta = {
    title: "Components/Bond/BondRecoveryDetails",
    component: BondRecoveryDetails,
    tags: ["autodocs"],
} satisfies Meta<typeof BondRecoveryDetails>;

export default meta;
type Story = StoryObj<typeof meta>;

const claimer = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

export const NoWinner: Story = {
    args: {
        bondRecovery: {
            disposition: "NO_WINNER",
            claimer: null,
            payment: null,
        },
    },
};

export const Recoverable: Story = {
    args: {
        bondRecovery: {
            disposition: "RECOVERABLE",
            claimer,
            payment: 250_000_000_000_000_000n,
        },
    },
};

export const Recovered: Story = {
    args: {
        bondRecovery: {
            disposition: "RECOVERED",
            claimer: null,
            payment: null,
        },
        recovery: createBondEvent({
            type: "BOND_RECOVERED",
            refund: null,
            recovery: {
                commitment:
                    "0x725e9d3febbdd79841345f187aacf343ee497214277f3cb330aca90319cbdd92",
                claimer,
                payment: 250_000_000_000_000_000n,
                burned: 50_000_000_000_000_000n,
            },
        }) as BondRecoveredEvent,
    },
};

/**
 * A recoverable bond whose payment is zero, which is still a valid value.
 */
export const RecoverableZeroPayment: Story = {
    args: {
        bondRecovery: { disposition: "RECOVERABLE", claimer, payment: 0n },
    },
};

/**
 * A recoverable bond that anyone can recover from the explorer. The story
 * uses a regular connection, as the action is hidden for mocked data.
 */
export const RecoverableWithAction: Story = {
    parameters: { connectionType: "system" },
    args: {
        ...Recoverable.args,
        tournamentAddress: "0xA2835312696Afa86c969e40831857dbB1412627f",
    },
};
