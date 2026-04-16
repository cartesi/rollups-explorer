import { describe, expect, it } from "vitest";
import { CycleRangeFormatted } from "../../src/components/CycleRangeFormatted";
import { render, screen } from "../test-utils";

describe("CycleRangeFormatted", () => {
    it("formats cycle ranges with thousands separator", () => {
        render(<CycleRangeFormatted range={[1000, 2000]} />);

        expect(screen.getByText("1,000 → 2,000")).toBeInTheDocument();
    });
});
