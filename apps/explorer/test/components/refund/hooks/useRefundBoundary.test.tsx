import { useEpochs } from "@cartesi/react";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useRefundBoundary } from "../../../../src/components/refund/hooks/useRefundBoundary";
import { refundEpochs } from "../../../../src/stories/refunds";

vi.mock("@cartesi/react", async () => {
    const actual = await vi.importActual("@cartesi/react");
    return { ...actual, useEpochs: vi.fn() };
});

const mockEpochs = vi.mocked(useEpochs);
const application = "0x40a7C73a6a592D8697bE97254E273E6f3FB46000";
const acceptedEpoch = refundEpochs[1];

describe("useRefundBoundary", () => {
    beforeEach(() => {
        mockEpochs.mockReset();
    });

    it("should start right after the last accepted epoch", () => {
        mockEpochs.mockReturnValue({
            data: { data: [acceptedEpoch] },
            isLoading: false,
        } as never);

        const { result } = renderHook(() => useRefundBoundary(application));

        expect(mockEpochs).toHaveBeenCalledWith({
            application,
            status: ["CLAIM_ACCEPTED"],
            descending: true,
            limit: 1,
            enabled: true,
        });
        expect(result.current).toEqual({
            epochIndex: acceptedEpoch.index + 1n,
            inputIndex: acceptedEpoch.inputIndexUpperBound,
            isLoading: false,
        });
    });

    it("should start at zero when no epoch was accepted", () => {
        mockEpochs.mockReturnValue({
            data: { data: [] },
            isLoading: false,
        } as never);

        const { result } = renderHook(() => useRefundBoundary(application));

        expect(result.current).toEqual({
            epochIndex: 0n,
            inputIndex: 0n,
            isLoading: false,
        });
    });

    it("should be unknown until the epochs are read", () => {
        mockEpochs.mockReturnValue({
            data: undefined,
            isLoading: true,
        } as never);

        const { result } = renderHook(() => useRefundBoundary(application));

        expect(result.current).toEqual({
            epochIndex: undefined,
            inputIndex: undefined,
            isLoading: true,
        });
    });

    it("should not read when disabled or without an application", () => {
        mockEpochs.mockReturnValue({
            data: undefined,
            isLoading: false,
        } as never);

        renderHook(() => useRefundBoundary(application, { enabled: false }));
        renderHook(() => useRefundBoundary(undefined));

        expect(mockEpochs).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({ enabled: false }),
        );
        expect(mockEpochs).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({ application: undefined, enabled: false }),
        );
    });
});
