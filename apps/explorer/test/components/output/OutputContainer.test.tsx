import { beforeEach, describe, expect, it, vi } from "vitest";
import { OutputContainer } from "../../../src/components/output/OutputContainer";
import { createApplication, render, screen } from "../../test-utils";

const mocks = vi.hoisted(() => ({
    useOutputs: vi.fn(),
}));

vi.mock("@cartesi/wagmi", () => ({
    useOutputs: mocks.useOutputs,
}));

vi.mock("../../../src/components/output/OutputList", () => ({
    OutputList: ({
        onPaginationChange,
    }: {
        onPaginationChange?: (offset: number) => void;
    }) => (
        <button onClick={() => onPaginationChange?.(10)}>
            Rendered output list
        </button>
    ),
}));

const application = createApplication().applicationAddress;

describe("OutputContainer", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("shows loading, error, and empty states", () => {
        mocks.useOutputs.mockReturnValue({ isLoading: true });
        const { rerender } = render(
            <OutputContainer application={application} />,
        );
        expect(screen.getByText("Checking for outputs...")).toBeVisible();

        mocks.useOutputs.mockReturnValue({
            isLoading: false,
            isError: true,
            error: new Error("Unavailable"),
        });
        rerender(<OutputContainer application={application} />);
        expect(screen.getByText("Could not fetch the outputs")).toBeVisible();

        mocks.useOutputs.mockReturnValue({
            isLoading: false,
            isError: false,
            data: {
                data: [],
                pagination: { limit: 50, offset: 0, totalCount: 0 },
            },
        });
        rerender(<OutputContainer application={application} />);
        expect(screen.getByText("No outputs generated")).toBeVisible();
    });

    it("queries outputs with defaults and updates its offset from pagination", () => {
        mocks.useOutputs.mockReturnValue({
            isLoading: false,
            isError: false,
            data: {
                data: [{ index: 1n }],
                pagination: { limit: 50, offset: 0, totalCount: 51 },
            },
        });
        const { rerender } = render(
            <OutputContainer application={application} />,
        );

        expect(mocks.useOutputs).toHaveBeenLastCalledWith({
            application,
            epochIndex: undefined,
            inputIndex: undefined,
            outputType: undefined,
            voucherAddress: undefined,
            limit: 50,
            offset: 0,
            descending: true,
        });

        screen.getByRole("button", { name: "Rendered output list" }).click();
        rerender(<OutputContainer application={application} />);

        expect(mocks.useOutputs).toHaveBeenLastCalledWith(
            expect.objectContaining({ offset: 10 }),
        );
    });
});
