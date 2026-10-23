import { describe, expect, it, vi } from "vitest";
import { SummaryCards } from "../../../src/components/application/SummaryCards";
import type { SummaryCardProps } from "../../../src/components/SummaryCard";
import { fireEvent, render, screen, waitFor } from "../../test-utils";

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: vi.fn() }),
}));

const card = (title: string, value: number): SummaryCardProps => ({
    title,
    value,
    displaySkeleton: false,
});

// jsdom matches no media query, so the `base` breakpoint applies: one
// card per row and the top three stay visible.
const perRow = { base: 1, xs: 2, sm: 3 };
const eight = [
    card("Epochs", 53),
    card("Inputs", 4),
    card("Outputs", 2),
    card("Reports", 0),
    card("Withdrawals", 2),
    card("Refunds", 1),
    card("Tournaments", 52),
    card("Bond events", 96),
];

describe("SummaryCards", () => {
    it("should keep the first cards visible and collapse the rest", () => {
        render(<SummaryCards cards={eight} perRow={perRow} />);

        expect(screen.getByText("Epochs")).toBeVisible();
        expect(screen.getByText("Outputs")).toBeVisible();
        expect(screen.getByText("Reports")).not.toBeVisible();
        expect(screen.getByText("Bond events")).not.toBeVisible();
        expect(
            screen.getByRole("button", { name: "Show 5 more counters" }),
        ).toHaveAttribute("aria-expanded", "false");
    });

    it("should expand and collapse the extra cards from the caret", async () => {
        render(<SummaryCards cards={eight} perRow={perRow} />);

        fireEvent.click(
            screen.getByRole("button", { name: "Show 5 more counters" }),
        );

        const hide = screen.getByRole("button", {
            name: "Hide extra counters",
        });
        expect(hide).toHaveAttribute("aria-expanded", "true");
        await waitFor(() =>
            expect(screen.getByText("Bond events")).toBeVisible(),
        );

        fireEvent.click(hide);

        expect(
            screen.getByRole("button", { name: "Show 5 more counters" }),
        ).toBeInTheDocument();
    });

    it("should start expanded when asked", () => {
        render(<SummaryCards cards={eight} perRow={perRow} defaultOpened />);

        expect(screen.getByText("Bond events")).toBeVisible();
        expect(
            screen.getByRole("button", { name: "Hide extra counters" }),
        ).toBeInTheDocument();
    });

    it("should show no caret when every card fits", () => {
        render(<SummaryCards cards={eight.slice(0, 3)} perRow={perRow} />);

        expect(screen.getByText("Outputs")).toBeVisible();
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
});
