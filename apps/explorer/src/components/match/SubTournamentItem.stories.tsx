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
const range: CycleRange = [1837880065n, 2453987565n];

const inner = applications[0].epochs[3].tournament?.matches?.[0].tournament!;
const leaf = inner.matches?.[0].tournament!;

/**
 * Navigation to an inner tournament of a three-level table.
 */
export const Inner: Story = {
    args: {
        claim: claim(0),
        now,
        range,
        timestamp: now,
        tournament: inner,
    },
};

/**
 * Navigation to a leaf tournament.
 */
export const Leaf: Story = {
    args: {
        claim: claim(0),
        now,
        range,
        timestamp: now,
        tournament: leaf,
    },
};
