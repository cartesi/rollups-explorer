import type { Meta, StoryObj } from "@storybook/nextjs";
import * as BondLedgerStories from "../components/bond/BondLedger.stories";
import { applications } from "../stories/data";
import { createBondEvent } from "../stories/prt";
import { BondEventPage } from "./BondEventPage";

const meta = {
    title: "Pages/BondEvent",
    component: BondEventPage,
    tags: ["autodocs"],
} satisfies Meta<typeof BondEventPage>;

export default meta;
type Story = StoryObj<typeof meta>;

const events = BondLedgerStories.Recovered.args.events;

export const Refund: Story = {
    args: { application: applications[0].name, event: events[0] },
};

export const RefundNotPaid: Story = {
    args: { application: applications[0].name, event: events[4] },
};

export const Recovery: Story = {
    args: {
        application: applications[0].name,
        event: events[events.length - 1],
    },
};

export const ZeroValueRefund: Story = {
    args: {
        application: applications[0].name,
        event: createBondEvent({
            refund: {
                recipient: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                value: 0n,
                success: true,
            },
        }),
    },
};
