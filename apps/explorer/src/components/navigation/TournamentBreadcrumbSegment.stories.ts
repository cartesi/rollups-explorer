import type { Meta, StoryObj } from "@storybook/nextjs";
import { TournamentBreadcrumbSegment } from "./TournamentBreadcrumbSegment";

const meta = {
    title: "Components/Navigation/TournamentBreadcrumbSegment",
    component: TournamentBreadcrumbSegment,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof TournamentBreadcrumbSegment>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RootTournament: Story = {
    args: {
        tournament: { level: 0n, kind: "NON_LEAF" },
    },
};

/**
 * A level between the root and the leaves, in tables with more than two.
 */
export const InnerTournament: Story = {
    args: {
        tournament: { level: 1n, kind: "NON_LEAF" },
    },
};

export const LeafTournament: Story = {
    args: {
        tournament: { level: 1n, kind: "LEAF" },
    },
};

export const RootTournamentVariant: Story = {
    args: {
        tournament: { level: 0n, kind: "NON_LEAF" },
        variant: "outline",
    },
};

export const Loading: Story = {
    args: {},
};
