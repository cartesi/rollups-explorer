import type { Meta, StoryObj } from "@storybook/nextjs";
import type { PartialBondRefundEvent } from "../../lib/bondUtils";
import { createBondEvent } from "../../stories/prt";
import { BondRefund } from "./BondRefund";

const meta = {
    title: "Components/Bond/BondRefund",
    component: BondRefund,
    tags: ["autodocs"],
} satisfies Meta<typeof BondRefund>;

export default meta;
type Story = StoryObj<typeof meta>;

const recipient = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

const refund = (value: bigint, success: boolean) =>
    createBondEvent({
        refund: { recipient, value, success },
    }) as PartialBondRefundEvent;

export const Paid: Story = {
    args: { refund: refund(1_200_000_000_000_000n, true) },
};

export const NotPaid: Story = {
    args: { refund: refund(1_200_000_000_000_000n, false) },
};

export const Zero: Story = {
    args: { refund: refund(0n, true) },
};
