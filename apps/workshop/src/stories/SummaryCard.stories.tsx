import type { Meta, StoryObj } from "@storybook/react";
import { TbInbox } from "react-icons/tb";

import { SummaryCard } from "@cartesi/rollups-explorer-ui";

const meta: Meta<typeof SummaryCard> = {
    component: SummaryCard,
};

export default meta;
type Story = StoryObj<typeof SummaryCard>;

//👇 Throws a type error it the args don't match the component props
export const Default: Story = {
    args: {
        icon: TbInbox,
        title: "Inputs",
        value: 34,
    },
};

export const NoIcon: Story = {
    args: {
        title: "Inputs",
        value: 34,
    },
};

export const LargeNumber: Story = {
    args: {
        title: "Inputs",
        value: 9999999999,
    },
};
