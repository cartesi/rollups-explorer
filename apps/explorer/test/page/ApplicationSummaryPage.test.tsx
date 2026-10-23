import type { Input } from "@cartesi/client";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { ApplicationSummaryPage } from "../../src/page/ApplicationSummaryPage";
import {
    erc20DepositInput,
    etherDepositInput,
    refundableDeposits,
    refundEpochs,
} from "../../src/stories/refunds";
import { createApplication, fireEvent, render, screen } from "../test-utils";

vi.mock("next/navigation", () => ({
    useParams: () => ({ application: "aeron" }),
    usePathname: () => "/apps/aeron",
    useRouter: () => ({ push: vi.fn() }),
    useSearchParams: () => new URLSearchParams(),
}));

vi.mock("../../src/components/input/InputCard", () => ({
    InputCard: ({ input, footer }: { input: Input; footer?: ReactNode }) => (
        <div data-testid="input-card">
            {input.index.toString()}
            {footer}
        </div>
    ),
}));

vi.mock("../../src/components/refund/RefundDepositAction", () => ({
    RefundDepositAction: ({
        input,
        onRefunded,
    }: {
        input: Input;
        onRefunded?: () => void;
    }) => (
        <button data-testid="refund-action" onClick={onRefunded}>
            {input.index.toString()}
        </button>
    ),
}));

vi.mock("../../src/components/refund/RefundableDeposits", () => ({
    RefundableDeposits: ({ deposits }: { deposits: unknown[] }) =>
        deposits.length > 0 ? (
            <div data-testid="refundable-deposits">{deposits.length}</div>
        ) : null,
}));

const loaded = { isLoading: false };
const baseProps = {
    bondEvents: { totalCount: 0, ...loaded },
    inputs: {
        data: [etherDepositInput, erc20DepositInput],
        totalCount: 4,
        ...loaded,
    },
    epochs: { data: refundEpochs, totalCount: 53, ...loaded },
    withdrawals: { data: [], totalCount: 0, ...loaded },
    outputs: { totalCount: 2, ...loaded },
    refunds: { totalCount: 1, ...loaded },
    reports: { totalCount: 0, ...loaded },
    tournaments: { data: [], totalCount: 0, ...loaded },
    refundableFromEpoch: refundEpochs[0].index,
};
const refundable = {
    data: refundableDeposits,
    totalCount: refundableDeposits.length,
    ...loaded,
};
const foreclosed = createApplication({
    name: "aeron",
    forecloseBlock: 15498n,
    forecloseTransaction:
        "0x0000000000000000000000000000000000000000000000000000000000000012",
});

describe("ApplicationSummaryPage", () => {
    it("should not mention refunds for an application that is not foreclosed", () => {
        render(
            <ApplicationSummaryPage
                {...baseProps}
                application={createApplication({ name: "aeron" })}
                refundableDeposits={refundable}
            />,
        );

        expect(
            screen.queryByTestId("refundable-deposits"),
        ).not.toBeInTheDocument();
        expect(screen.queryByTestId("refund-action")).not.toBeInTheDocument();
        expect(screen.getAllByTestId("input-card")).toHaveLength(2);
        expect(screen.queryByText("Refunds")).not.toBeInTheDocument();
    });

    it("should list the refundable deposits and offer the refund on the latest inputs", () => {
        render(
            <ApplicationSummaryPage
                {...baseProps}
                application={foreclosed}
                refundableDeposits={refundable}
            />,
        );

        expect(screen.getByTestId("refundable-deposits")).toHaveTextContent(
            "3",
        );
        const actions = screen.getAllByTestId("refund-action");
        expect(actions).toHaveLength(2);
        expect(actions[0]).toHaveTextContent("3");
        expect(screen.getByText("Refunds")).toBeInTheDocument();
    });

    it("should not offer the refund on the latest inputs until the refundable epoch is known", () => {
        render(
            <ApplicationSummaryPage
                {...baseProps}
                application={foreclosed}
                refundableDeposits={refundable}
                refundableFromEpoch={undefined}
            />,
        );

        expect(screen.getByTestId("refundable-deposits")).toBeInTheDocument();
        expect(screen.queryByTestId("refund-action")).not.toBeInTheDocument();
    });

    it("should refresh the deposits and the refund count after a refund", () => {
        const refetchDeposits = vi.fn();
        const refetchCount = vi.fn();
        render(
            <ApplicationSummaryPage
                {...baseProps}
                application={foreclosed}
                refunds={{ totalCount: 1, ...loaded, refetch: refetchCount }}
                refundableDeposits={{ ...refundable, refetch: refetchDeposits }}
            />,
        );

        fireEvent.click(screen.getAllByTestId("refund-action")[0]);

        expect(refetchDeposits).toHaveBeenCalledOnce();
        expect(refetchCount).toHaveBeenCalledOnce();
    });

    it("should not mention refunds when nothing is refundable", () => {
        render(
            <ApplicationSummaryPage
                {...baseProps}
                application={foreclosed}
                refundableDeposits={{ data: [], totalCount: 0, ...loaded }}
            />,
        );

        expect(
            screen.queryByTestId("refundable-deposits"),
        ).not.toBeInTheDocument();
    });
});
