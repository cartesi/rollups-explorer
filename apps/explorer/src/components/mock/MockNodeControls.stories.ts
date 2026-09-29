import type { Meta, StoryObj } from "@storybook/nextjs";
import { fn } from "storybook/test";
import { MockNodeControls } from "./MockNodeControls";

const meta = {
    title: "Components/Mock/MockNodeControls",
    component: MockNodeControls,
    tags: ["autodocs"],
    args: {
        head: 25_012n,
        playing: true,
        speed: 1,
        onPlay: fn(),
        onPause: fn(),
        onSpeedChange: fn(),
        onStep: fn(),
        onReplay: fn(),
        onReset: fn(),
    },
} satisfies Meta<typeof MockNodeControls>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The chain produces a block every 12 seconds.
 */
export const Playing: Story = {};

/**
 * The head holds until played again or stepped one block at a time.
 */
export const Paused: Story = {
    args: { playing: false },
};

/**
 * Sixty blocks every 12 seconds, to watch a dispute play out.
 */
export const Fast: Story = {
    args: { speed: 60, head: 31_480n },
};

/**
 * On an application page its scenario can be replayed from the start.
 */
export const Replayable: Story = {
    args: { replayable: "AppNine" },
};
