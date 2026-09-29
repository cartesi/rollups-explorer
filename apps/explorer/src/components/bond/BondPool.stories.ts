import type { Meta, StoryObj } from "@storybook/nextjs";
import { BondPool } from "./BondPool";

const meta = {
    title: "Components/Bond/BondPool",
    component: BondPool,
    tags: ["autodocs"],
} satisfies Meta<typeof BondPool>;

export default meta;
type Story = StoryObj<typeof meta>;

const bondValue = 21_300_000_000_000_000n;
const deposited = 2n * bondValue;
const refunded = 3_100_000_000_000_000n;
const balance = deposited - refunded;
const payment = bondValue + (balance - bondValue) / 10n;

/**
 * A running tournament: two joins, gas refunds paid from their bonds and the
 * balance left in the contract.
 */
export const Running: Story = {
    args: {
        bondValue,
        balance,
        pool: {
            deposited,
            exact: true,
            joins: 2,
            refunded,
            refunds: 14,
            paid: 0n,
            burned: 0n,
        },
    },
};

/**
 * After recovery the winner's claimer got one bond plus a tenth of the
 * residual, and the rest was burned, leaving nothing in the contract.
 */
export const Recovered: Story = {
    args: {
        ...Running.args,
        balance: 0n,
        pool: {
            ...Running.args.pool,
            paid: payment,
            burned: balance - payment,
        },
    },
};

/**
 * One join went through another contract, so the deposited total is only a
 * minimum.
 */
export const RelayedJoin: Story = {
    args: {
        ...Running.args,
        pool: { ...Running.args.pool, exact: false },
    },
};

/**
 * The bond value, join bonds and balance are still loading.
 */
export const Loading: Story = {
    args: {
        pool: { ...Running.args.pool, deposited: 0n, exact: false },
        loading: true,
    },
};
