import type { Withdrawal } from "@cartesi/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WithdrawalsPage } from "../../src/page/WithdrawalsPage";
import { createWithdrawal, fireEvent, render, screen } from "../test-utils";

const mocks = vi.hoisted(() => ({
    updateUrlQueryString: vi.fn(),
}));

vi.mock("../../src/hooks/useUpdateQueryString", () => ({
    default: () => [mocks.updateUrlQueryString],
}));

vi.mock("../../src/components/withdrawal/WithdrawalSearch", () => ({
    WithdrawalSearch: ({
        onAccountIndexChange,
        onLimitChange,
        onSortChange,
    }: {
        onAccountIndexChange: (value: string) => void;
        onLimitChange: (value: 10 | 30 | 50) => void;
        onSortChange: (value: { value: "asc" | "desc" }) => void;
    }) => (
        <div>
            <button onClick={() => onAccountIndexChange("7")}>
                Filter account index
            </button>
            <button
                onClick={() => {
                    onAccountIndexChange("7");
                    onAccountIndexChange("");
                }}
            >
                Clear account index
            </button>
            <button onClick={() => onSortChange({ value: "asc" })}>
                Sort ascending
            </button>
            <button onClick={() => onLimitChange(30)}>Set limit</button>
        </div>
    ),
}));

vi.mock("../../src/components/withdrawal/WithdrawalList", () => ({
    WithdrawalList: ({ withdrawals }: { withdrawals: Withdrawal[] }) => (
        <div data-testid="withdrawal-list">{withdrawals.length}</div>
    ),
}));

const renderPage = (withdrawals: { data: Withdrawal[]; isLoading: boolean }) =>
    render(
        <WithdrawalsPage
            withdrawals={withdrawals}
            pagination={{ offset: 0, limit: 10, totalCount: 20 }}
        />,
    );

describe("WithdrawalsPage", () => {
    beforeEach(() => {
        mocks.updateUrlQueryString.mockReset();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("renders loading, empty, and list states", () => {
        const { rerender } = renderPage({ data: [], isLoading: true });
        expect(screen.getByText("Loading withdrawals...")).toBeVisible();

        rerender(
            <WithdrawalsPage
                withdrawals={{ data: [], isLoading: false }}
                pagination={{ offset: 0, limit: 10, totalCount: 0 }}
            />,
        );
        expect(screen.getByText("No withdrawals found")).toBeVisible();

        rerender(
            <WithdrawalsPage
                withdrawals={{ data: [createWithdrawal()], isLoading: false }}
                pagination={{ offset: 0, limit: 10, totalCount: 1 }}
            />,
        );
        expect(screen.getByTestId("withdrawal-list")).toHaveTextContent("1");
    });

    it("debounces account-index query updates", () => {
        vi.useFakeTimers();
        renderPage({ data: [createWithdrawal()], isLoading: false });

        fireEvent.click(
            screen.getByRole("button", { name: "Filter account index" }),
        );
        expect(mocks.updateUrlQueryString).not.toHaveBeenCalled();

        vi.advanceTimersByTime(299);
        expect(mocks.updateUrlQueryString).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1);
        expect(mocks.updateUrlQueryString).toHaveBeenLastCalledWith([
            { name: "ai", value: "7" },
            { name: "offset", value: "0" },
        ]);
    });

    it("uses the final account-index value after rapid changes", () => {
        vi.useFakeTimers();
        renderPage({ data: [createWithdrawal()], isLoading: false });

        fireEvent.click(
            screen.getByRole("button", { name: "Clear account index" }),
        );
        vi.advanceTimersByTime(300);

        expect(mocks.updateUrlQueryString).toHaveBeenCalledTimes(1);
        expect(mocks.updateUrlQueryString).toHaveBeenLastCalledWith([
            { name: "ai", value: "" },
            { name: "offset", value: "0" },
        ]);
    });

    it("updates query parameters immediately for select controls", () => {
        renderPage({ data: [createWithdrawal()], isLoading: false });

        fireEvent.click(screen.getByRole("button", { name: "Sort ascending" }));
        expect(mocks.updateUrlQueryString).toHaveBeenLastCalledWith([
            { name: "sv", value: "asc" },
            { name: "offset", value: "0" },
        ]);

        fireEvent.click(screen.getByRole("button", { name: "Set limit" }));
        expect(mocks.updateUrlQueryString).toHaveBeenLastCalledWith([
            { name: "lv", value: "30" },
            { name: "offset", value: "0" },
        ]);
    });

    it("updates the offset when changing pages", () => {
        renderPage({ data: [createWithdrawal()], isLoading: false });

        fireEvent.click(screen.getByRole("button", { name: "2" }));

        expect(mocks.updateUrlQueryString).toHaveBeenLastCalledWith([
            { name: "offset", value: "10" },
        ]);
    });
});
