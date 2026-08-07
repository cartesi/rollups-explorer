import { describe, expect, it, vi } from "vitest";
import { WithdrawalSearch } from "../../../src/components/withdrawal/WithdrawalSearch";
import { fireEvent, render, screen } from "../../test-utils";

describe("WithdrawalSearch", () => {
    const renderSearch = () => {
        const onAccountIndexChange = vi.fn();
        const onSortChange = vi.fn();
        const onLimitChange = vi.fn();

        render(
            <WithdrawalSearch
                accountIndex={42n}
                sort={{ value: "desc" }}
                limit={10}
                onAccountIndexChange={onAccountIndexChange}
                onSortChange={onSortChange}
                onLimitChange={onLimitChange}
            />,
        );

        return { onAccountIndexChange, onSortChange, onLimitChange };
    };

    it("shows the current account index", () => {
        renderSearch();

        expect(screen.getByLabelText("Account index")).toHaveValue("42");
    });

    it("emits account index changes", () => {
        const { onAccountIndexChange } = renderSearch();

        fireEvent.change(screen.getByLabelText("Account index"), {
            target: { value: "7" },
        });

        expect(onAccountIndexChange).toHaveBeenCalledWith("7");
    });

    it("keeps the account-index draft value until its prop changes", () => {
        const onAccountIndexChange = vi.fn();
        const onSortChange = vi.fn();
        const onLimitChange = vi.fn();
        const { rerender } = render(
            <WithdrawalSearch
                accountIndex={42n}
                sort={{ value: "desc" }}
                limit={10}
                onAccountIndexChange={onAccountIndexChange}
                onSortChange={onSortChange}
                onLimitChange={onLimitChange}
            />,
        );

        fireEvent.change(screen.getByLabelText("Account index"), {
            target: { value: "7" },
        });
        expect(screen.getByLabelText("Account index")).toHaveValue("7");

        rerender(
            <WithdrawalSearch
                accountIndex={42n}
                sort={{ value: "desc" }}
                limit={10}
                onAccountIndexChange={onAccountIndexChange}
                onSortChange={onSortChange}
                onLimitChange={onLimitChange}
            />,
        );
        expect(screen.getByLabelText("Account index")).toHaveValue("7");

        rerender(
            <WithdrawalSearch
                accountIndex={7n}
                sort={{ value: "desc" }}
                limit={10}
                onAccountIndexChange={onAccountIndexChange}
                onSortChange={onSortChange}
                onLimitChange={onLimitChange}
            />,
        );
        expect(screen.getByLabelText("Account index")).toHaveValue("7");
    });

    it("emits sort and limit changes", () => {
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