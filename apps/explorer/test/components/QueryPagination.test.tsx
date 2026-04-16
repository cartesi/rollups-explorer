import { describe, expect, it, vi } from "vitest";
import { QueryPagination } from "../../src/components/QueryPagination";
import { fireEvent, render, screen } from "../test-utils";

describe("QueryPagination component", () => {
    it("should not render when there is a single page and hideIfSinglePage=true", () => {
        render(
            <QueryPagination
                pagination={{ offset: 0, limit: 10, totalCount: 10 }}
            />,
        );

        expect(screen.queryByText("1")).not.toBeInTheDocument();
    });

    it("should render pagination when there are multiple pages", () => {
        render(
            <QueryPagination
                pagination={{ offset: 0, limit: 10, totalCount: 30 }}
            />,
        );

        expect(screen.getByRole("button", { name: "1" })).toBeVisible();
        expect(screen.getByRole("button", { name: "2" })).toBeVisible();
        expect(screen.getByRole("button", { name: "3" })).toBeVisible();
    });

    it("should call onPaginationChange with the computed offset", () => {
        const onPaginationChange = vi.fn();
        render(
            <QueryPagination
                pagination={{ offset: 0, limit: 10, totalCount: 30 }}
                onPaginationChange={onPaginationChange}
                hideIfSinglePage={false}
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: "2" }));
        expect(onPaginationChange).toHaveBeenCalledWith(10);
    });
});
