import type { Withdrawal } from "@cartesi/viem";
import { describe, expect, it, vi } from "vitest";
import { WithdrawalPaginatedList } from "../../../src/components/withdrawal/WithdrawalPaginatedList";
import { createWithdrawal, fireEvent, render, screen } from "../../test-utils";

vi.mock("../../../src/components/withdrawal/WithdrawalList", () => ({
    WithdrawalList: ({ withdrawals }: { withdrawals: Withdrawal[] }) => (
        <div data-testid="withdrawal-list">
            {withdrawals.map((w) => w.output).join(",")}
        </div>
    ),
}));

describe("WithdrawalPaginatedList", () => {
    it("renders the list and forwards pagination changes", () => {
        const onPaginationChange = vi.fn();
        const withdrawals = [createWithdrawal()];
        render(
            <WithdrawalPaginatedList
                withdrawals={withdrawals}
                pagination={{ offset: 0, limit: 1, totalCount: 20 }}
                onPaginationChange={onPaginationChange}
            />,
        );

        expect(screen.getByText("20")).toBeVisible();
        expect(screen.getByText(withdrawals[0].output)).toBeVisible();

        fireEvent.click(screen.getByRole("button", { name: "2" }));

        expect(onPaginationChange).toHaveBeenCalledWith(1);
    });
});
