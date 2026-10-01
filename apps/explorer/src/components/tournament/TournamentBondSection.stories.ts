import type { Meta, StoryObj } from "@storybook/nextjs";
import { TournamentBondSection } from "./TournamentBondSection";
import * as ViewStories from "./TournamentView.stories";

const meta = {
    title: "Components/Tournament/TournamentBondSection",
    component: TournamentBondSection,
    tags: ["autodocs"],
} satisfies Meta<typeof TournamentBondSection>;

export default meta;
type Story = StoryObj<typeof meta>;

const fromView = (args: (typeof ViewStories.BondPoolRunning)["args"]) => ({
    bondEvents: args.bondEvents ?? [],
    bondPool: args.bondPool,
    joins: args.commitments.length,
    tournament: args.tournament,
});

/**
 * A running tournament collapses to the split bar and the balance left.
 */
export const RunningCollapsed: Story = {
    args: fromView(ViewStories.BondPoolRunning.args),
};

/**
 * Expanded, the summary gives way to every pool row.
 */
export const RunningExpanded: Story = {
    args: { ...RunningCollapsed.args, defaultOpen: true },
};

/**
 * A recoverable bond offers the recovery straight from the summary. The
 * balance is left out to keep the line short.
 */
export const RecoverableCollapsed: Story = {
    parameters: { connectionType: "system" },
    args: fromView(ViewStories.RecoverableBond.args),
};

/**
 * Expanded, the recovery moves next to the unclaimed payment.
 */
export const RecoverableExpanded: Story = {
    parameters: { connectionType: "system" },
    args: { ...RecoverableCollapsed.args, defaultOpen: true },
};

/**
 * On a phone the summary keeps only the status, and the unclaimed payment,
 * recovery and hint wrap below their label.
 */
export const RecoverableExpandedMobile: Story = {
    ...RecoverableExpanded,
    globals: { viewport: { value: "mobile1" } },
};

/**
 * Recovered: the status and the bar, without the empty balance.
 */
export const RecoveredCollapsed: Story = {
    args: fromView(ViewStories.BondPoolRecovered.args),
};

/**
 * Without a winner the balance stays locked, so the summary keeps it.
 */
export const NoWinnerCollapsed: Story = {
    args: fromView(ViewStories.BondPoolNoWinner.args),
};

/**
 * The bond value, join bonds and balance are still loading.
 */
export const LoadingExpanded: Story = {
    args: {
        ...fromView(ViewStories.BondPoolLoading.args),
        defaultOpen: true,
    },
};
