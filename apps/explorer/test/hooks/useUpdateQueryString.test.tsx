import { renderHook } from "@testing-library/react";
import {
    ReadonlyURLSearchParams,
    usePathname,
    useRouter,
    useSearchParams,
} from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import useUpdateQueryString from "../../src/hooks/useUpdateQueryString";

vi.mock("next/navigation", () => ({
    useRouter: vi.fn(),
    usePathname: vi.fn(),
    useSearchParams: vi.fn(),
}));

const mockPush = vi.fn();

const mockUseRouter = vi.mocked(useRouter, { partial: true });
const mockUsePathname = vi.mocked(usePathname, { partial: true });
const mockUseSearchParams = vi.mocked(useSearchParams, { partial: true });

const setup = (pathname = "/app", searchParamsString = "") => {
    mockUseRouter.mockReturnValue({ push: mockPush });
    mockUsePathname.mockReturnValue(pathname);
    mockUseSearchParams.mockReturnValue(
        new URLSearchParams(searchParamsString) as ReadonlyURLSearchParams,
    );
};

describe("useUpdateQueryString Hook", () => {
    beforeEach(() => {
        mockPush.mockReset();
    });

    describe("createQueryString Function", () => {
        it("should add a new query param", () => {
            setup("/app", "");
            const { result } = renderHook(() => useUpdateQueryString());
            const [, createQueryString] = result.current;

            expect(createQueryString([{ name: "page", value: "2" }])).toBe(
                "page=2",
            );
        });

        it("should update an existing query param", () => {
            setup("/app", "page=1");
            const { result } = renderHook(() => useUpdateQueryString());
            const [, createQueryString] = result.current;

            expect(createQueryString([{ name: "page", value: "5" }])).toBe(
                "page=5",
            );
        });

        it("should delete a param when value is empty string", () => {
            setup("/app", "page=1&filter=foo");
            const { result } = renderHook(() => useUpdateQueryString());
            const [, createQueryString] = result.current;

            expect(createQueryString([{ name: "page", value: "" }])).toBe(
                "filter=foo",
            );
        });

        it("should delete a param when value is null-like (empty)", () => {
            setup("/app", "page=1");
            const { result } = renderHook(() => useUpdateQueryString());
            const [, createQueryString] = result.current;
            expect(createQueryString([{ name: "page", value: "" }])).toBe("");
        });

        it("should handle multiple params at once", () => {
            setup("/app", "a=1");
            const { result } = renderHook(() => useUpdateQueryString());
            const [, createQueryString] = result.current;

            const qs = createQueryString([
                { name: "b", value: "2" },
                { name: "c", value: "3" },
            ]);

            expect(qs).toBe("a=1&b=2&c=3");
        });

        it("should preserve existing params that are not updated", () => {
            setup("/app", "filter=active&page=1");
            const { result } = renderHook(() => useUpdateQueryString());
            const [, createQueryString] = result.current;

            expect(createQueryString([{ name: "page", value: "2" }])).toBe(
                "filter=active&page=2",
            );
        });
    });

    describe("updateUrlQueryString Function", () => {
        it("should call router.push with pathname and query string", () => {
            setup("/app", "");
            const { result } = renderHook(() => useUpdateQueryString());
            const [updateUrlQueryString] = result.current;

            updateUrlQueryString([{ name: "page", value: "3" }]);

            expect(mockPush).toHaveBeenCalledWith("/app?page=3", {
                scroll: false,
            });
        });

        it("should call router.push with only pathname when query string is empty", () => {
            setup("/app", "page=2");
            const { result } = renderHook(() => useUpdateQueryString());
            const [updateUrlQueryString] = result.current;

            updateUrlQueryString([{ name: "page", value: "" }]);

            expect(mockPush).toHaveBeenCalledWith("/app", { scroll: false });
        });

        it("should clear all params when all values are empty", () => {
            setup("/app", "page=1&filter=foo");
            const { result } = renderHook(() => useUpdateQueryString());
            const [updateUrlQueryString] = result.current;

            updateUrlQueryString([
                { name: "page", value: "" },
                { name: "filter", value: "" },
            ]);

            expect(mockPush).toHaveBeenCalledWith("/app", { scroll: false });
        });

        it("should use the current pathname", () => {
            setup("/my/custom/path", "");
            const { result } = renderHook(() => useUpdateQueryString());
            const [updateUrlQueryString] = result.current;

            updateUrlQueryString([{ name: "tab", value: "overview" }]);

            expect(mockPush).toHaveBeenCalledWith(
                "/my/custom/path?tab=overview",
                { scroll: false },
            );
        });
    });
});
