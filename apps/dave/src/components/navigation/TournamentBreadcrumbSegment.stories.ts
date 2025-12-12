import type { Meta, StoryObj } from "@storybook/react-vite";
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

/**
 * Breadcrumbs for a bottom tournament.
 */
export const BottomTournament: Story = {
    args: {
        level: 2n,
    },
};

/**
 * Breadcrumbs for a middle tournament.
 */
export const MidTournament: Story = {
    args: {
        level: 1n,
    },
};

/**
 * Breadcrumbs for a top tournament.
 */
export const TopTournament: Story = {
    args: {
        level: 0n,
    },
};

export const TopTournamentVariant: Story = {
    args: {
        level: 0n,
        variant: "outline",
    },
};
