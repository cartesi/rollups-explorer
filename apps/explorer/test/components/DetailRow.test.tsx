import { describe, expect, it } from "vitest";
import { DetailRow } from "../../src/components/DetailRow";
import { render, screen } from "../test-utils";

describe("DetailRow", () => {
    it("should render the label next to its value", () => {
        render(<DetailRow label="Leaf size">128 mcycles</DetailRow>);

        expect(screen.getByText("Leaf size")).toBeInTheDocument();
        expect(screen.getByText("128 mcycles")).toBeInTheDocument();
    });

    it("should explain the label with a hint", () => {
        render(
            <DetailRow label="Cycle range" hint="A position, not work done">
                Input #0
            </DetailRow>,
        );

        expect(
            screen.getByLabelText("A position, not work done"),
        ).toBeInTheDocument();
    });
});
