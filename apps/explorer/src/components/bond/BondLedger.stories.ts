import type { Meta, StoryObj } from "@storybook/nextjs";
import { createBondEvent } from "../../stories/prt";
import { BondLedger } from "./BondLedger";

const meta = {
    title: "Components/Bond/BondLedger",
    component: BondLedger,
    tags: ["autodocs"],
} satisfies Meta<typeof BondLedger>;

export default meta;
type Story = StoryObj<typeof meta>;

const claimer = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

/**
 * Gas refunds newest first, as the node lists them with `descending`.
 */
const refunds = Array.from({ length: 14 }, (_, i) =>
    createBondEvent({
        blockNumber: BigInt(100 + i),
        logIndex: BigInt(i),
        refund: {
            recipient: claimer,
            value: 1_200_000_000_000_000n,
            success: i % 5 !== 4,
        },
    }),
).reverse();

export const Ongoing: Story = {
    args: { events: refunds },
};

export const Recovered: Story = {
    args: {
        events: [
            createBondEvent({
                blockNumber: 200n,
                type: "BOND_RECOVERED",
                refund: null,
                recovery: {
                    commitment:
                        "0x725e9d3febbdd79841345f187aacf343ee497214277f3cb330aca90319cbdd92",
                    claimer,
                    payment: 250_000_000_000_000_000n,
                    burned: 50_000_000_000_000_000n,
                },
            }),
            ...refunds,
        ],
    },
};

export const Empty: Story = {
    args: { events: [] },
};

/**
 * Every gas refund payment failed: the values were requested, never paid.
 */
export const AllRefundsFailed: Story = {
    args: {
        events: Array.from({ length: 6 }, (_, i) =>
            createBondEvent({
                blockNumber: BigInt(100 + i),
                logIndex: BigInt(i),
                refund: {
                    recipient: claimer,
                    value: 900_000_000_000_000n,
                    success: false,
                },
            }),
        ).reverse(),
    },
};
