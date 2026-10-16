import type { Input } from "@cartesi/client";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { InputList } from "../../../src/components/input/InputList";
import { createDepositInput } from "../../../src/stories/deposits";
import { createApplication, fireEvent, render, screen } from "../../test-utils";

vi.mock("../../../src/components/input/InputCard", () => ({
    InputCard: ({ input, footer }: { input: Input; footer?: ReactNode }) => (
        <div data-testid="input-card">
            {input.index.toString()}
            {footer}
        </div>
    ),
}));

vi.mock("../../../src/components/refund/RefundDepositAction", () => ({
    RefundDepositAction: ({
        input,
        epochStatus,
        onRefunded,
    }: {
        input: Input;
        epochStatus?: string;
        onRefunded?: () => void;
    }) => (
        <button data-testid="refund-action" onClick={onRefunded}>
            {input.index.toString()}:{epochStatus ?? "unknown"}
        </button>
    ),
}));

const inputs = [
    createDepositInput({ index: 3n, epochIndex: 52n }),
    createDepositInput({ index: 0n, epochIndex: 51n }),
];
const foreclosed = createApplication({
    forecloseBlock: 15498n,
    forecloseTransaction:
        "0x0000000000000000000000000000000000000000000000000000000000000012",
});

describe("InputList", () => {
    it("should render one card per input", () => {
        render(<InputList inputs={inputs} />);

        expect(screen.getAllByTestId("input-card")).toHaveLength(2);
        expect(screen.queryByTestId("refund-action")).not.toBeInTheDocument();
    });

    it("should not add the refund action for an application that is not foreclosed", () => {
        render(<InputList inputs={inputs} application={createApplication()} />);

        expect(screen.queryByTestId("refund-action")).not.toBeInTheDocument();
    });

    it("should add the refund action to inputs of a foreclosed application", () => {
        render(
            <InputList
                inputs={inputs}
                application={foreclosed}
                epochStatusByIndex={
                    new Map([
                        [52n, "CLAIM_FORECLOSED"],
                        [51n, "CLAIM_ACCEPTED"],
                    ])
                }
            />,
        );

        const actions = screen.getAllByTestId("refund-action");

        expect(actions).toHaveLength(1);
        expect(actions[0]).toHaveTextContent("3:CLAIM_FORECLOSED");
    });

    it("should pass the refund callback to every action", () => {
        const onRefunded = vi.fn();
        render(
            <InputList
                inputs={inputs}
                application={foreclosed}
                onRefunded={onRefunded}
            />,
        );

        fireEvent.click(screen.getAllByTestId("refund-action")[0]);

        expect(onRefunded).toHaveBeenCalledOnce();
    });

    it("should leave the epoch check to the action when the status is unknown", () => {
        render(<InputList inputs={inputs} application={foreclosed} />);

        expect(screen.getAllByTestId("refund-action")).toHaveLength(2);
        expect(screen.getByText("0:unknown")).toBeInTheDocument();
    });
});
