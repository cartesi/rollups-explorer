import { Timeline } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { SubTournamentItem } from "../../components/match/SubTournamentItem";
import type { CycleRange } from "../../components/types";
import { applications } from "../../stories/data";
import { claim } from "../../stories/util";

const meta = {
    title: "Components/Match/SubTournamentItem",
    component: SubTournamentItem,
    tags: ["autodocs"],
    decorators: [
        (Story) => (
            <Timeline bulletSize={24} lineWidth={2}>
                <Story />
            </Timeline>
        ),
    ],
} satisfies Meta<typeof SubTournamentItem>;

export default meta;
type Story = StoryObj<typeof meta>;

const now = Math.floor(Date.now() / 1000);
const range = [1837880065, 2453987565] as CycleRange;

const middle = applications[0].epochs[3].tournament?.matches?.[0].tournament!;
const bottom = middle.matches?.[0].tournament!;

/**
 * Navigation to middle tournament.
 */
export const Middle: Story = {
    args: {
        claim: claim(0),
        now,
        range,
        timestamp: now,
        tournament: middle,
    },
};

/**
 * Navigation to bottom tournament.
 */
export const Bottom: Story = {
    args: {
        claim: claim(0),
        now,
        range,
        timestamp: now,
        tournament: bottom,
    },
};
