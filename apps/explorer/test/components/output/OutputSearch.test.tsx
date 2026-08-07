import { describe, expect, it, vi } from "vitest";
import { OutputSearch } from "../../../src/components/output/OutputSearch";
import { fireEvent, render, screen } from "../../test-utils";

const renderSearch = (filter = {}) => {
    const onFilterChange = vi.fn();
    const onSortChange = vi.fn();
    const onLimitChange = vi.fn();

    render(
        <OutputSearch
            filter={filter}
            sort={{ value: "desc" }}
            limit={10}
            onFilterChange={onFilterChange}
            onSortChange={onSortChange}
            onLimitChange={onLimitChange}
        />,
    );

    return { onFilterChange, onSortChange, onLimitChange };
};

describe("OutputSearch", () => {
    it("emits the selected output-type filter", () => {
        const { onFilterChange } = renderSearch();

        fireEvent.click(screen.getByRole("textbox", { name: "Filter by" }));
        fireEvent.click(screen.getByRole("option", { name: "Voucher" }));

        expect(onFilterChange).toHaveBeenCalledWith({
            type: { key: "outputType", value: "Voucher" },
        });
    });

    it("clears the filter when all output types are selected", () => {
        const { onFilterChange } = renderSearch({
            type: { key: "outputType", value: "Voucher" },
        });

        fireEvent.click(screen.getByRole("textbox", { name: "Filter by" }));
        fireEvent.click(screen.getByRole("option", { name: "All" }));

        expect(onFilterChange).toHaveBeenCalledWith({});
    });

    it("emits selected sort and limit values", () => {
        const { onLimitChange, onSortChange } = renderSearch();

        fireEvent.click(screen.getByRole("textbox", { name: "Sort by" }));
        fireEvent.click(screen.getByRole("option", { name: "Ascending" }));

        fireEvent.click(
            screen.getByRole("textbox", {
                name: "Quantity of items per page",
            }),
        );
        fireEvent.click(
            screen.getByRole("option", { name: "Show 30 items per page" }),
        );

        expect(onSortChange).toHaveBeenCalledWith({ value: "asc" });
        expect(onLimitChange).toHaveBeenCalledWith(30);
    });
});
