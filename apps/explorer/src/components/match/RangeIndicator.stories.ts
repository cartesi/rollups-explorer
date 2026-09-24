import type { Meta, StoryObj } from "@storybook/nextjs";
import { RangeIndicator } from "./RangeIndicator";

const meta = {
    title: "Components/Match/RangeIndicator",
    component: RangeIndicator,
    tags: ["autodocs"],
} satisfies Meta<typeof RangeIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Indicator for the full range
 */
export const Full: Story = {
    args: { domain: [0n, 100n], value: [0n, 100n] },
};

/**
 * Indicator for first half
 */
export const FirstHalf: Story = {
    args: { domain: [0n, 100n], value: [0n, 50n] },
};

/**
 * Indicator for second half
 */
export const SecondHalf: Story = {
    args: { domain: [0n, 100n], value: [50n, 100n] },
};

/**
 * Indicator for empty range
 */
export const Empty: Story = {
    args: { domain: [0n, 100n], value: [0n, 0n] },
};

/**
 * Indicator for second quarter
 */
export const SecondQuarter: Story = {
    args: { domain: [0n, 100n], value: [25n, 50n] },
};

/**
 * Indicator for large domain value with a small range
 */
const start = 1837880065n;
const end = 2453987565n;
const step = (end - start) / 16n;
export const LargeDomain: Story = {
    args: {
        domain: [start, end],
        value: [start + step * 8n, start + step * 9n],
    },
};

/**
 * RealValue
 */
export const RealValue: Story = {
    args: { domain: [start, end], value: [start, (start + end) / 2n] },
};

/**
 * Different color. Use the `c` prop to change the color.
 */
export const Color: Story = {
    args: { domain: [0n, 100n], value: [25n, 50n], color: "green" },
};

/**
 * Different background. Use the `bg` prop to change the background color.
 */
export const LargeWithLabels: Story = {
    args: {
        h: 16,
        domain: [start, end],
        value: [start, (start + end) / 2n],
        withLabels: true,
    },
};
