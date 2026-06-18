import type { Meta, StoryObj } from "@storybook/nextjs";
import { applications } from "../../stories/data";
import { EpochCard } from "./EpochCard";

const meta = {
    title: "Components/Epoch/EpochCard",
    component: EpochCard,
    tags: ["autodocs"],
} satisfies Meta<typeof EpochCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Card for an open epoch
 */
export const Open: Story = {
    args: { epoch: { ...applications[0].epochs[4], status: "OPEN" } },
};

export const InputsProcessed: Story = {
    args: {
        epoch: { ...applications[0].epochs[3], status: "INPUTS_PROCESSED" },
    },
};

/**
 * Card for a closed epoch
 */
export const Closed: Story = {
    args: { epoch: { ...applications[0].epochs[3], status: "CLOSED" } },
};

/**
 * Card for an epoch that claim is staged
 */
export const ClaimStaged: Story = {
    args: { epoch: { ...applications[0].epochs[3], status: "CLAIM_STAGED" } },
};

export const ClaimComputed: Story = {
    args: { epoch: { ...applications[0].epochs[3], status: "CLAIM_COMPUTED" } },
};

export const ClaimSubmitted: Story = {
    args: {
        epoch: { ...applications[0].epochs[3], status: "CLAIM_SUBMITTED" },
    },
};

export const ClaimForeclosed: Story = {
    args: {
        epoch: { ...applications[0].epochs[3], status: "CLAIM_FORECLOSED" },
    },
};

/**
 * Card for a finalized epoch
 */
export const Finalized: Story = {
    args: { epoch: { ...applications[0].epochs[2], status: "CLAIM_ACCEPTED" } },
};
