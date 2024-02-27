import { renderHook } from "@testing-library/react";
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation";
import { describe, expect, it, vi } from "vitest";
import { useQueryParams } from "../../src/hooks/useQueryParams";

vi.mock("next/navigation", async () => {
    const navigation = await vi.importActual("next/navigation");
    return {
        ...(navigation as any),
        usePathname: vi.fn(() => "/"),
        useRouter: () => ({
            push: vi.fn(),
        }),
        useSearchParams: vi.fn(() => new URLSearchParams()),
    };
});

const queryAddress = "0xdd1f9B83507327f29C2C1Bb42011faD5fb482dc6";
const mockedUseSearchParams = vi.mocked(useSearchParams);

describe("useQueryParams", () => {
    beforeEach(() => {
        // Reset the mock before each test
        vi.restoreAllMocks();
    });

    it("should return empty query on the first render", () => {
        const { result } = renderHook(() => useQueryParams());
        expect(result.current.query).toBe("");
    });

    it("should return the correct query address", () => {
        mockedUseSearchParams.mockReturnValue(
            new URLSearchParams(
                `?query=${queryAddress}`,
            ) as ReadonlyURLSearchParams,
        );
        const { result } = renderHook(() => useQueryParams());
        expect(result.current.query).toBe(queryAddress);
    });
});
