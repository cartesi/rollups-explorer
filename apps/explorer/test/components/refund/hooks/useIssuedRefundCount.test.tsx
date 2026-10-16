import { useReadIApplicationGetNumberOfIssuedRefunds } from "@cartesi/react";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useIssuedRefundCount } from "../../../../src/components/refund/hooks/useIssuedRefundCount";
import { createApplication } from "../../../test-utils";

vi.mock("@cartesi/react", () => ({
    useReadIApplicationGetNumberOfIssuedRefunds: vi.fn(),
}));

const mockRead = vi.mocked(useReadIApplicationGetNumberOfIssuedRefunds);
const refetch = vi.fn();
const foreclosed = createApplication({
    forecloseBlock: 15498n,
    forecloseTransaction:
        "0x0000000000000000000000000000000000000000000000000000000000000012",
});

describe("useIssuedRefundCount", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockRead.mockReturnValue({
            data: 2n,
            isLoading: false,
            error: null,
            refetch,
        } as never);
    });

    it("should read the count of a foreclosed application", () => {
        const { result } = renderHook(() => useIssuedRefundCount(foreclosed));

        expect(mockRead).toHaveBeenCalledWith({
            address: foreclosed.applicationAddress,
            query: { enabled: true },
        });
        expect(result.current).toEqual({
            count: 2,
            isLoading: false,
            error: null,
            refetch,
        });
    });

    it("should read nothing for an application that is not foreclosed", () => {
        mockRead.mockReturnValue({
            data: undefined,
            isLoading: false,
            error: null,
            refetch,
        } as never);

        const { result } = renderHook(() =>
            useIssuedRefundCount(createApplication()),
        );

        expect(mockRead).toHaveBeenCalledWith(
            expect.objectContaining({ query: { enabled: false } }),
        );
        expect(result.current.count).toBe(0);
    });

    it("should report the read in flight only when enabled", () => {
        mockRead.mockReturnValue({
            data: undefined,
            isLoading: true,
            error: null,
            refetch,
        } as never);

        expect(
            renderHook(() => useIssuedRefundCount(foreclosed)).result.current
                .isLoading,
        ).toBe(true);
        expect(
            renderHook(() => useIssuedRefundCount(undefined)).result.current
                .isLoading,
        ).toBe(false);
    });
});
