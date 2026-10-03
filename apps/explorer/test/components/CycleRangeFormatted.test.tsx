import { describe, expect, it } from "vitest";
import { CycleRangeFormatted } from "../../src/components/CycleRangeFormatted";
import { render, screen } from "../test-utils";

describe("CycleRangeFormatted", () => {
    it("formats a range inside one machine cycle with an inclusive end", () => {
        render(<CycleRangeFormatted range={[1000n, 2000n]} />);

        expect(
            screen.getByText("Input #0 · mcycle 0 · ucycle 1,000 – 1,999"),
        ).toBeInTheDocument();
    });

    it("formats the whole epoch as its inputs", () => {
        render(<CycleRangeFormatted range={[0n, 1n << 92n]} />);

        expect(
            screen.getByText("Input #0 – #16,777,215 · whole epoch"),
        ).toBeInTheDocument();
    });
});
