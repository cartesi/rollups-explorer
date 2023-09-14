import type { Meta, StoryObj } from "@storybook/react";

import { Summary } from "@cartesi/rollups-explorer-ui";

const meta: Meta<typeof Summary> = {
    component: Summary,
};

export default meta;
type Story = StoryObj<typeof Summary>;

export const Default: Story = {
    args: {
        applications: 30,
        inputs: 832,
    },
};

export const Zero: Story = {
    args: {
        applications: 0,
        inputs: 0,
    },
};
