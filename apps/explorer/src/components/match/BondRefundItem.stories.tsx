import { Timeline } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { content } from "../../content";
import * as BondRefundStories from "../bond/BondRefund.stories";
import { BondRefundItem } from "./BondRefundItem";

const meta = {
    title: "Components/Match/BondRefundItem",
    component: BondRefundItem,
    tags: ["autodocs"],
    decorators: [
        (Story) => (
            <Timeline bulletSize={24} lineWidth={2}>
                <Story />
            </Timeline>
        ),
    ],
} satisfies Meta<typeof BondRefundItem>;

export default meta;
type Story = StoryObj<typeof meta>;

const now = Date.now();

export const MatchClosing: Story = {
    args: {
        label: content.match.gasRefund.matchClosingTxt,
        now,
        refund: BondRefundStories.Paid.args.refund,
    },
};

export const LeafSealNotPaid: Story = {
    args: {
        label: content.match.gasRefund.leafSealTxt,
        now,
        refund: BondRefundStories.NotPaid.args.refund,
    },
};

export const SubTournamentCreation: Story = {
    args: {
        label: content.match.gasRefund.subTournamentCreationTxt,
        now,
        refund: BondRefundStories.Paid.args.refund,
    },
};
