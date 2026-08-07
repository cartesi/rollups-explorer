import type { Withdrawal } from "@cartesi/viem";
import { describe, expect, it, vi } from "vitest";
import { WithdrawalCard } from "../../../src/components/withdrawal/WithdrawalCard";
import { createWithdrawal, render, screen } from "../../test-utils";

vi.mock("../../../src/components/TransactionHash", () => ({
    default: ({ transactionHash }: { transactionHash: string }) => (
        <span data-testid="transaction-hash">{transactionHash}</span>
    ),
}));

vi.mock("../../../src/components/withdrawal/WithdrawalView", () => ({
    WithdrawalView: ({ withdrawal }: { withdrawal: Withdrawal }) => (
        <span data-testid="withdrawal-view">{withdrawal.account}</span>
    ),
}));

const withdrawal = createWithdrawal();

describe("WithdrawalCard", () => {
    it("renders the account index and delegates withdrawal details", () => {
        render(<WithdrawalCard withdrawal={withdrawal} />);

        expect(screen.getByText("# 1")).toBeVisible();
        expect(screen.getByTestId("withdrawal-view")).toHaveTextContent(
            withdrawal.account,
        );
        expect(screen.getByTestId("transaction-hash")).toHaveTextContent(
            withdrawal.transactionHash,
        );
    });
});
