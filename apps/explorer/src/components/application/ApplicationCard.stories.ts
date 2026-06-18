import type { Meta, StoryObj } from "@storybook/nextjs";
import { applications } from "../../stories/data";
import { ApplicationCard } from "./ApplicationCard";

const meta = {
    title: "Components/Application/ApplicationCard",
    component: ApplicationCard,
    tags: ["autodocs"],
} satisfies Meta<typeof ApplicationCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default application card
 */
export const Enabled: Story = {
    args: { application: applications[0] },
};

/**
 * Card for a disabled application
 */
export const Disabled: Story = {
    args: { application: { ...applications[0], status: "OK", enabled: false } },
};

/**
 * Card for a failed application but still enabled
 */
export const Failed: Story = {
    args: {
        application: { ...applications[0], status: "FAILED", enabled: true },
    },
};

export const Foreclosed: Story = {
    args: {
        application: {
            ...applications[0],
            consensusType: "AUTHORITY",
            status: "OK",
            enabled: true,
            forecloseBlock: 123456n,
            forecloseTransaction:
                "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        },
    },
};

/**
 * Card for application that DIVERGED
 */
export const Diverged: Story = {
    args: {
        application: {
            ...applications[0],
            status: "DIVERGED",
            reason: "Node's computed claim disagrees with accepted claim on chain.",
            enabled: false,
        },
    },
};

export const Corrupted: Story = {
    args: {
        application: {
            ...applications[0],
            status: "CORRUPTED",
            reason: "The local state is missing or inconsistent",
            enabled: false,
        },
    },
};

const bigReason = Array.from(
    { length: 50 },
    (_, i) => `The local state is missing or inconsistent. ${i + 1}`,
).join(". ");

export const CorruptedWithBigReason: Story = {
    args: {
        application: {
            ...applications[0],
            status: "CORRUPTED",
            reason: bigReason,
            enabled: false,
        },
    },
};

/**
 * Card for applications with no inputs
 */
export const NoInputs: Story = {
    args: { application: { ...applications[0], processedInputs: 0n } },
};

/**
 * Card for applications that use an Authority consensus
 */
export const AuthorityConsensus: Story = {
    args: { application: { ...applications[0], consensusType: "AUTHORITY" } },
};
