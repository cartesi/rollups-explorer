import type { Meta, StoryObj } from "@storybook/nextjs";
import { CycleRangeFormatted } from "./CycleRangeFormatted";

const meta = {
    title: "Components/CycleRangeFormatted",
    component: CycleRangeFormatted,
    tags: ["autodocs"],
} satisfies Meta<typeof CycleRangeFormatted>;

export default meta;
type Story = StoryObj<typeof meta>;

const metaCycle = (input: bigint, mcycle: bigint, ucycle = 0n) =>
    (input << 68n) + (mcycle << 20n) + ucycle;

/**
 * A root tournament spans every input of the epoch.
 */
export const WholeEpoch: Story = {
    args: { range: [0n, 1n << 92n] },
};

/**
 * After 24 root advances the dispute is exactly one input.
 */
export const WholeInput: Story = {
    args: { range: [metaCycle(5n, 0n), metaCycle(6n, 0n)] },
};

/**
 * One root leaf: 16,777,216 mcycles within one input.
 */
export const McyclesWithinInput: Story = {
    args: {
        range: [
            metaCycle(3n, 21_990_349_996_032n),
            metaCycle(3n, 21_990_349_996_032n) + (1n << 44n),
        ],
    },
};

/**
 * A bottom-level segment: 128 ucycles within one mcycle.
 */
export const UcyclesWithinMcycle: Story = {
    args: {
        range: [
            metaCycle(3n, 21_990_354_846_085n, 512n),
            metaCycle(3n, 21_990_354_846_085n, 512n) + 128n,
        ],
    },
};

/**
 * A range that crosses inputs without aligning to them.
 */
export const AcrossInputs: Story = {
    args: { range: [metaCycle(3n, 10n), metaCycle(4n, 20n)] },
};
