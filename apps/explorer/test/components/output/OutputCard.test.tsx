import type { Output } from "@cartesi/viem";
import { describe, expect, it, vi } from "vitest";
import { OutputCard } from "../../../src/components/output/OutputCard";
import { createApplication, fireEvent, render, screen } from "../../test-utils";

vi.mock("../../../src/components/output/OutputView", () => ({
    OutputView: ({ displayAs }: { displayAs: string }) => (
        <div data-testid="output-view">{displayAs}</div>
    ),
}));

const output = {
    index: 1n,
    epochIndex: 2n,
    inputIndex: 3n,
} as Output;

describe("OutputCard", () => {
    it("shows output metadata and links to its epoch", () => {
        render(<OutputCard output={output} application={createApplication()} />);

        expect(screen.getByText("# 1")).toBeVisible();
        expect(screen.getByText("Input #3")).toBeVisible();
        expect(screen.getByRole("link", { name: "Epoch #2" })).toHaveAttribute(
            "href",
            "/apps/My App/epochs/2",
        );
        expect(screen.getByTestId("output-view")).toHaveTextContent("raw");
    });

    it("changes the selected decoder", () => {
        render(<OutputCard output={output} application={createApplication()} />);

        fireEvent.click(screen.getByLabelText("Decoded"));

        expect(screen.getByTestId("output-view")).toHaveTextContent("decoded");
    });
});