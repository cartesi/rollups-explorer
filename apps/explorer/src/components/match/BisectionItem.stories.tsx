import { Timeline } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { claim } from "../../stories/util";
import type { CycleRange } from "../types";
import { BisectionItem } from "./BisectionItem";

const meta = {
    title: "Components/Match/BisectionItem",
    component: BisectionItem,
    tags: ["autodocs"],
    decorators: [
        (Story) => (
            <Timeline bulletSize={24} lineWidth={2}>
                <Story />
            </Timeline>
        ),
    ],
} satisfies Meta<typeof BisectionItem>;

export default meta;
type Story = StoryObj<typeof meta>;

const now = Math.floor(Date.now() / 1000);
const range: CycleRange = [1837880065n, 2453987565n];
const [start, end] = range;

/**
 * Bisection in the middle of the range.
 */
export const Middle: Story = {
    args: {
        claim: claim(0),
        color: "gray.6",
        domain: range,
        index: 5,
        now,
        range: [(start + end) / 2n, end],
        timestamp: now - 64,
        total: 48,
    },
};

/**
 * Bisection in the middle of the range.
 */
export const Quarter: Story = {
    args: {
        claim: claim(1),
        color: "gray.6",
        domain: [0n, 100n],
        index: 15,
        now,
        range: [25n, 50n],
        timestamp: now - 5398,
        total: 20,
    },
};

/**
 * Bisection in the middle of the range.
 */
export const Expand: Story = {
    args: {
        claim: claim(1),
        color: "gray.6",
        domain: [0n, 100n],
        expand: true,
        index: 15,
        now,
        range: [(100n * 3n) / 16n, (100n * 4n) / 16n],
        timestamp: now - 5398,
        total: 20,
    },
};
