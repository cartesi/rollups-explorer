import type { Meta, StoryObj } from "@storybook/react";

import { ERC20DepositForm } from "@cartesi/rollups-explorer-ui";

const meta: Meta<typeof ERC20DepositForm> = {
    component: ERC20DepositForm,
};

export default meta;
type Story = StoryObj<typeof ERC20DepositForm>;

export const Default: Story = {
    args: {},
};
