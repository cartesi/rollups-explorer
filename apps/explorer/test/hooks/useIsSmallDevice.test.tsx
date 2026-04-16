import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useIsSmallDevice } from "../../src/hooks/useIsSmallDevice";

vi.mock("@mantine/core", () => ({
    useMantineTheme: vi.fn(() => ({
        breakpoints: { sm: "48em" },
    })),
}));

vi.mock("@mantine/hooks", () => ({
    useMediaQuery: vi.fn(),
    useViewportSize: vi.fn(),
}));

import { useMantineTheme, type MantineTheme } from "@mantine/core";
import { useMediaQuery, useViewportSize } from "@mantine/hooks";

const mockUseMantineTheme = vi.mocked(useMantineTheme);
const mockUseMediaQuery = vi.mocked(useMediaQuery);
const mockUseViewportSize = vi.mocked(useViewportSize);

describe("useIsSmallDevice Hook", () => {
    it("should return isSmallDevice: true when viewport matches small breakpoint", () => {
        mockUseMediaQuery.mockReturnValue(true);
        mockUseViewportSize.mockReturnValue({ width: 400, height: 800 });

        const { result } = renderHook(() => useIsSmallDevice());

        expect(result.current.isSmallDevice).toBe(true);
        expect(result.current.viewport).toEqual({ width: 400, height: 800 });
    });

    it("should return isSmallDevice: false on large viewports", () => {
        mockUseMediaQuery.mockReturnValue(false);
        mockUseViewportSize.mockReturnValue({ width: 1440, height: 900 });

        const { result } = renderHook(() => useIsSmallDevice());

        expect(result.current.isSmallDevice).toBe(false);
        expect(result.current.viewport).toEqual({ width: 1440, height: 900 });
    });

    it("should call useMediaQuery with the theme sm breakpoint", () => {
        mockUseMantineTheme.mockReturnValue({
            breakpoints: { sm: "48em" },
        } as MantineTheme);
        mockUseMediaQuery.mockReturnValue(false);
        mockUseViewportSize.mockReturnValue({ width: 1024, height: 768 });

        renderHook(() => useIsSmallDevice());

        expect(mockUseMediaQuery).toHaveBeenCalledWith("(max-width:48em)");
    });

    it("should reflect updated viewport dimensions", () => {
        mockUseMediaQuery.mockReturnValue(false);
        mockUseViewportSize.mockReturnValue({ width: 800, height: 600 });

        const { result } = renderHook(() => useIsSmallDevice());

        expect(result.current.viewport.width).toBe(800);
        expect(result.current.viewport.height).toBe(600);
    });
});
