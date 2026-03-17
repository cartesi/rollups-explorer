import type { Meta, StoryObj } from "@storybook/nextjs";
import { claim } from "../../stories/util";
import { MatchBreadcrumbs } from "./MatchBreadcrumbs";

const meta = {
    title: "Components/Navigation/MatchBreadcrumbs",
    component: MatchBreadcrumbs,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof MatchBreadcrumbs>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Breadcrumbs for a bottom match.
 */
export const BottomMatch: Story = {
    args: {
        matches: [
            {
                commitmentOne: claim(0).hash,
                commitmentTwo: claim(1).hash,
            },
            {
                commitmentOne: claim(2).hash,
                commitmentTwo: claim(3).hash,
            },
            {
                commitmentOne: claim(4).hash,
                commitmentTwo: claim(5).hash,
            },
        ],
        separatorMargin: 5,
    },
};

/**
 * Breadcrumbs for a middle match.
 */
export const MidMatch: Story = {
    args: {
        matches: [
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
 * Breadcrumbs for a top match.
 */
export const TopMatch: Story = {
    args: {
        matches: [
            {
                commitmentOne: claim(0).hash,
                commitmentTwo: claim(1).hash,
            },
        ],
    },
};
