import { Timeline } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { ClaimsEliminatedItem } from "./ClaimsEliminatedItem";

const meta = {
    title: "Components/Match/ClaimsEliminatedItem",
    component: ClaimsEliminatedItem,
    tags: ["autodocs"],
    decorators: [
        (Story) => (
            <Timeline bulletSize={24} lineWidth={2}>
                <Story />
            </Timeline>
        ),
    ],
} satisfies Meta<typeof ClaimsEliminatedItem>;

export default meta;
type Story = StoryObj<typeof meta>;

const now = Math.floor(Date.now() / 1000);

/**
 * Claims eliminated
 */
export const Default: Story = {
    args: {
        now,
        timestamp: now - 3452,
    },
};
