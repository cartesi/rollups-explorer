import type { Meta, StoryObj } from "@storybook/react-vite";
import { claim } from "../../stories/util";
import { TournamentBreadcrumbs } from "./TournamentBreadcrumbs";

const meta = {
    title: "Components/Navigation/TournamentBreadcrumbs",
    component: TournamentBreadcrumbs,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof TournamentBreadcrumbs>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Breadcrumbs for a bottom tournament.
 */
export const BottomTournament: Story = {
    args: {
        parentMatches: [
            {
                commitmentOne: claim(0).hash,
                commitmentTwo: claim(1).hash,
            },
            {
                commitmentOne: claim(2).hash,
                commitmentTwo: claim(3).hash,
            },
        ],
    },
};

/**
 * Breadcrumbs for a middle tournament.
 */
export const MidTournament: Story = {
    args: {
        parentMatches: [
            {
                commitmentOne: claim(0).hash,
                commitmentTwo: claim(1).hash,
            },
        ],
    },
};

/**
 * Breadcrumbs for a top tournament.
 */
export const TopTournament: Story = {
    args: {
        parentMatches: [],
    },
};
