import type { Meta, StoryObj } from "@storybook/react";

import { ConnectButton } from "@rainbow-me/rainbowkit";

const meta: Meta<typeof ConnectButton> = {
    component: ConnectButton,
};

export default meta;
type Story = StoryObj<typeof ConnectButton>;

export const Default: Story = {
    args: {},
};

export const NoBalance: Story = {
    args: {
        showBalance: false,
    },
};

export const IconChainStatus: Story = {
    args: {
        chainStatus: "icon",
    },
};

export const NameChainStatus: Story = {
    args: {
        chainStatus: "name",
    },
};

export const NoneChainStatus: Story = {
    args: {
        chainStatus: "none",
    },
};
