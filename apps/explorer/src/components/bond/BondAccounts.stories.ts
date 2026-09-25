import type { Meta, StoryObj } from "@storybook/nextjs";
import { getBondAccounts } from "../../lib/bondUtils";
import { createBondEvent } from "../../stories/prt";
import * as BondLedgerStories from "./BondLedger.stories";
import { BondAccounts } from "./BondAccounts";

const meta = {
    title: "Components/Bond/BondAccounts",
    component: BondAccounts,
    tags: ["autodocs"],
} satisfies Meta<typeof BondAccounts>;

export default meta;
type Story = StoryObj<typeof meta>;

const opponent = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

export const SeveralAccounts: Story = {
    args: {
        accounts: getBondAccounts([
            ...BondLedgerStories.Recovered.args.events,
            ...Array.from({ length: 4 }, (_, i) =>
                createBondEvent({
                    logIndex: BigInt(50 + i),
                    refund: {
                        recipient: opponent,
                        value: 800_000_000_000_000n,
                        success: i !== 3,
                    },
                }),
            ),
        ]),
    },
};

export const SingleAccount: Story = {
    args: {
        accounts: getBondAccounts(BondLedgerStories.Ongoing.args.events),
    },
};

export const Empty: Story = {
    args: { accounts: [] },
};
