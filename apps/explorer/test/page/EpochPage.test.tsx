import type { Application, Input } from "@cartesi/client";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { EpochPage } from "../../src/page/EpochPage";
import { applications } from "../../src/stories/data";
import { createDepositInput } from "../../src/stories/deposits";
import { createTournament } from "../../src/stories/prt";
import { createApplication, render, screen } from "../test-utils";

vi.mock("next/navigation", () => ({
    usePathname: () => "/apps/app/epochs/3",
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
    RefundDepositAction: ({ epochStatus }: { epochStatus?: string }) => (
        <div data-testid="refund-action">{epochStatus}</div>
    ),
}));

const epoch = applications[0].epochs[3];

const application = {
    ...createApplication(),
    consensusType: "PRT",
} satisfies Application;

describe("EpochPage", () => {
    it("should flag the epoch as disputed while root matches are active", () => {
        render(
            <EpochPage
                application={application}
                epoch={epoch}
                inputs={[]}
                tournament={createTournament({
                    baseCycle: 0n,
                    log2step: 2n,
                    height: 3n,
                    snapshot: { standing: "MATCHES_ACTIVE" },
                })}
            />,
        );

        expect(screen.getByText("disputed")).toBeInTheDocument();
        expect(
            screen.getByText("Input #0 · mcycle 0 · ucycle 0 – 31"),
        ).toBeInTheDocument();
    });

    it("should not flag the epoch once the root tournament has no matches", () => {
        render(
            <EpochPage
                application={application}
                epoch={epoch}
                inputs={[]}
                tournament={createTournament({
                    snapshot: { standing: "AWAITING_CLOSURE" },
                })}
            />,
        );

        expect(screen.queryByText("disputed")).not.toBeInTheDocument();
    });

    it("should offer the refund on deposits of a foreclosed application", () => {
        render(
            <EpochPage
                application={{
                    ...application,
                    forecloseBlock: 15498n,
                    forecloseTransaction:
                        "0x0000000000000000000000000000000000000000000000000000000000000012",
                }}
                epoch={{ ...epoch, status: "CLAIM_FORECLOSED" }}
                inputs={[createDepositInput({ epochIndex: epoch.index })]}
            />,
        );

        expect(screen.getByTestId("refund-action")).toHaveTextContent(
            "CLAIM_FORECLOSED",
        );
    });

    it("should not mention refunds for an application that is not foreclosed", () => {
        render(
            <EpochPage
                application={application}
                epoch={epoch}
                inputs={[createDepositInput({ epochIndex: epoch.index })]}
            />,
        );

        expect(screen.getByTestId("input-card")).toBeInTheDocument();
        expect(screen.queryByTestId("refund-action")).not.toBeInTheDocument();
    });
});
