import type { Meta, StoryObj } from "@storybook/nextjs";
import { Ongoing } from "../components/tournament/TournamentView.stories";
import { MatchPage } from "./MatchPage";

const meta = {
    title: "Pages/Match",
    component: MatchPage,
    tags: ["autodocs"],
} satisfies Meta<typeof MatchPage>;

export default meta;
type Story = StoryObj<typeof meta>;

const now = Date.now();

export const TopLevelMatch: Story = {
    args: {
        advances: [],
        match: Ongoing.args.matches[1],
        now,
        tournament: Ongoing.args.tournament,
    },
};
