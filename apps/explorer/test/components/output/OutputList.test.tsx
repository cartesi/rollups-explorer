import type { Output } from "@cartesi/viem";
import { describe, expect, it, vi } from "vitest";
import { OutputList } from "../../../src/components/output/OutputList";
import { fireEvent, render, screen } from "../../test-utils";

vi.mock("../../../src/components/output/OutputView", () => ({
    OutputView: ({ output }: { output: Output }) => (
        <div data-testid="output-view">{output.index.toString()}</div>
    ),
}));

const outputs = [
    { index: 1n, epochIndex: 1n, inputIndex: 1n },
    { index: 2n, epochIndex: 1n, inputIndex: 1n },
] as Output[];

describe("OutputList", () => {
    it("renders each output", () => {
        render(
            <OutputList
                application="0x1234567890abcdef1234567890abcdef12345678"
                outputs={outputs}
                pagination={{ limit: 10, offset: 0, totalCount: 2 }}
            />,
        );

        expect(screen.getAllByTestId("output-view")).toHaveLength(2);
    });

    it("forwards page changes as offsets", () => {
        const onPaginationChange = vi.fn();
        render(
            <OutputList
                application="0x1234567890abcdef1234567890abcdef12345678"
                outputs={outputs}
                pagination={{ limit: 10, offset: 0, totalCount: 20 }}
                onPaginationChange={onPaginationChange}
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: "2" }));

        expect(onPaginationChange).toHaveBeenCalledWith(10);
    });
});
