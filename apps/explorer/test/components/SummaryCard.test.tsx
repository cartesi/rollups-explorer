import { describe, expect, it, vi } from "vitest";
import { SummaryCard } from "../../src/components/SummaryCard";
import { fireEvent, render, screen } from "../test-utils";

const push = vi.fn();

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push }),
}));

describe("SummaryCard component", () => {
    it("should render title and value", () => {
        render(
            <SummaryCard title="Matches" value={10} displaySkeleton={false} />,
        );

        expect(screen.getByText("Matches")).toBeInTheDocument();
        expect(screen.getByText("10")).toBeInTheDocument();
    });

    it("should render skeleton content when displaySkeleton is true", () => {
        render(<SummaryCard title="Matches" value={10} displaySkeleton />);

        expect(screen.queryByText("Matches")).not.toBeInTheDocument();
    });

    it("should navigate when href is provided and card is clicked", () => {
        render(
            <SummaryCard
                title="Matches"
                value={10}
                displaySkeleton={false}
                href="/matches"
            />,
        );

        fireEvent.click(screen.getByRole("link"));
        expect(push).toHaveBeenCalledWith("/matches");
    });
});
