import { afterEach, describe, expect, it, vi } from "vitest";
import { PrettyTime } from "../../src/components/PrettyTime";
import { fireEvent, render, screen } from "../test-utils";

describe("PrettyTime component", () => {
    afterEach(() => {
        vi.resetAllMocks();
    });

    it("should render relative text by default", () => {
        vi.spyOn(Date, "now").mockReturnValue(2_000);
        render(<PrettyTime milliseconds={1_000} />);
        expect(screen.getByText(/ago/i)).toBeInTheDocument();
    });

    it("should toggle to UTC timestamp when displayTimestampUTC is enabled", () => {
        vi.spyOn(Date, "now").mockReturnValue(1776359244345);
        const timestamp = 1776359234345;
        render(<PrettyTime milliseconds={timestamp} displayTimestampUTC />);

        const btn = screen.getByRole("button");
        fireEvent.click(btn);

        expect(
            screen.getByText(new Date(timestamp).toISOString()),
        ).toBeInTheDocument();
    });
});
