import type { Withdrawal } from "@cartesi/viem";
import { describe, expect, it, vi } from "vitest";
import { WithdrawalList } from "../../../src/components/withdrawal/WithdrawalList";
import { createWithdrawal, render, screen } from "../../test-utils";

vi.mock("../../../src/components/withdrawal/WithdrawalCard", () => ({
    WithdrawalCard: ({ withdrawal }: { withdrawal: Withdrawal }) => (
        <div data-testid="withdrawal-card">{withdrawal.accountIndex}</div>
    ),
}));

const withdrawals = [
    createWithdrawal({ accountIndex: 1n }),
    createWithdrawal({ accountIndex: 2n }),
];

describe("WithdrawalList", () => {
    it("renders one card for each withdrawal", () => {
        render(<WithdrawalList withdrawals={withdrawals} />);

        expect(screen.getAllByTestId("withdrawal-card")).toHaveLength(2);
        expect(screen.getByText("1")).toBeVisible();
        expect(screen.getByText("2")).toBeVisible();
    });
});
