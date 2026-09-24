import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useBlock } from "wagmi";
import { useRefetchOnFinalizedBlock } from "../../src/hooks/useRefetchOnFinalizedBlock";

vi.mock("wagmi", () => ({
    useBlock: vi.fn(),
}));

const mockUseBlock = vi.mocked(useBlock, { partial: true });

const finalized = (number: bigint) => ({ data: { number } }) as never;

describe("useRefetchOnFinalizedBlock", () => {
    beforeEach(() => {
        mockUseBlock.mockReset();
    });

    it("should refetch when a new finalized block arrives", () => {
        const refetch = vi.fn();
        mockUseBlock.mockReturnValue(finalized(10n));
        const { rerender } = renderHook(() =>
            useRefetchOnFinalizedBlock(true, [refetch]),
        );

        expect(refetch).not.toHaveBeenCalled();

        mockUseBlock.mockReturnValue(finalized(11n));
        rerender();

        expect(refetch).toHaveBeenCalledTimes(1);
    });

    it("should not refetch the same block twice", () => {
        const refetch = vi.fn();
        mockUseBlock.mockReturnValue(finalized(10n));
        const { rerender } = renderHook(() =>
            useRefetchOnFinalizedBlock(true, [refetch]),
        );
        rerender();

        expect(refetch).not.toHaveBeenCalled();
    });

    it("should not watch blocks while disabled", () => {
        const refetch = vi.fn();
        mockUseBlock.mockReturnValue(finalized(10n));
        const { rerender } = renderHook(() =>
            useRefetchOnFinalizedBlock(false, [refetch]),
        );
        mockUseBlock.mockReturnValue(finalized(11n));
        rerender();

        expect(refetch).not.toHaveBeenCalled();
        expect(mockUseBlock).toHaveBeenCalledWith({
            blockTag: "finalized",
            watch: false,
            query: { enabled: false },
        });
    });
});
