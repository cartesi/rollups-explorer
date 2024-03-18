import type { Meta, StoryObj } from "@storybook/react";

import { TransactionProgress } from "@cartesi/rollups-explorer-ui";
import { BaseError } from "viem";

const meta: Meta<typeof TransactionProgress> = {
    component: TransactionProgress,
};

export default meta;
type Story = StoryObj<typeof TransactionProgress>;

export const WaitingWallet: Story = {
    args: {
        prepare: { status: "success", error: null },
        execute: { status: "pending", error: null },
        wait: { status: "pending", fetchStatus: "idle", error: null },
    },
};

export const WaitingConfirmation: Story = {
    args: {
        prepare: { status: "success", error: null },
        execute: { status: "success", error: null },
        wait: { status: "pending", fetchStatus: "fetching", error: null },
    },
};

export const Success: Story = {
    args: {
        prepare: { status: "success", error: null },
        execute: { status: "success", error: null },
        wait: { status: "success", fetchStatus: "idle", error: null },
    },
};

export const Error: Story = {
    args: {
        prepare: {
            status: "error",
            error: new BaseError('The contract function "decimals" reverted.'),
        },
        execute: { status: "idle", error: null },
        wait: { status: "pending", fetchStatus: "idle", error: null },
    },
};

export const ErrorLong: Story = {
    args: {
        prepare: {
            status: "error",
            error: new BaseError('The contract function "decimals" reverted.', {
                details: `The contract function "decimals" reverted.

Contract Call:
  address:   0x70ac08179605AF2D9e75782b8DEcDD3c22aA4D0C
  function:  decimals()

Docs: https://viem.sh/docs/contract/readContract.html
Version: viem@1.10.12`,
            }),
        },
        execute: { status: "idle", error: null },
        wait: { status: "pending", fetchStatus: "idle", error: null },
    },
};
