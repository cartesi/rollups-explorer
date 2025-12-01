import type { Meta, StoryObj } from "@storybook/react-vite";
import * as TournamentStories from "../tournament/TournamentView.stories";
import * as MatchActionsStories from "./MatchActions.stories";
import { MatchView } from "./MatchView";

const meta = {
    title: "Components/Match/MatchView",
    component: MatchView,
} satisfies Meta<typeof MatchView>;

export default meta;
type Story = StoryObj<typeof meta>;

const now = Math.floor(Date.now() / 1000);

export const Ongoing: Story = {
    args: {
        tournament: TournamentStories.Ongoing.args.tournament,
        match: TournamentStories.Ongoing.args.matches[1],
        advances: MatchActionsStories.Bisections.args.advances,
        now,
        range: [1837880065, 2453987565],
    },
};

/**
 * A match that no claimer has taken action yet.
 */
export const NoActions: Story = {
    args: {
        tournament: TournamentStories.Ongoing.args.tournament,
        match: TournamentStories.Ongoing.args.matches[1],
        advances: [],
        now,
        range: [1837880065, 2453987565],
    },
};
