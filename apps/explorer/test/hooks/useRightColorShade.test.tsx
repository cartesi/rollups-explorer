import {
    useMantineColorScheme,
    useMantineTheme,
    type MantinePrimaryShade,
} from "@mantine/core";
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import useRightColorShade from "../../src/hooks/useRightColorShade";
import theme from "../../src/providers/theme";

vi.mock("@mantine/core", async () => {
    const actual =
        await vi.importActual<typeof import("@mantine/core")>("@mantine/core");
    return {
        ...actual,
        useMantineTheme: vi.fn(),
        useMantineColorScheme: vi.fn(),
    };
});

const mockUseMantineTheme = vi.mocked(useMantineTheme);
const mockUseMantineColorScheme = vi.mocked(useMantineColorScheme, {
    partial: true,
});

describe("useRightColorShade", () => {
    it("should return the light shade color when colorScheme is light", () => {
        mockUseMantineTheme.mockReturnValue(theme);
        mockUseMantineColorScheme.mockReturnValue({
            colorScheme: "light",
        });

        const { result } = renderHook(() => useRightColorShade("blue"));

        const lightShade = (theme.primaryShade as MantinePrimaryShade).light;
        expect(result.current).toBe(theme.colors.blue[lightShade]);
    });

    it("should return the dark shade color when colorScheme is dark", () => {
        mockUseMantineTheme.mockReturnValue(theme);
        mockUseMantineColorScheme.mockReturnValue({
            colorScheme: "dark",
        });

        const { result } = renderHook(() => useRightColorShade("blue"));

        const darkShade = (theme.primaryShade as MantinePrimaryShade).dark;
        expect(result.current).toBe(theme.colors.blue[darkShade]);
    });

    it("should treat auto colorScheme as light", () => {
        mockUseMantineTheme.mockReturnValue(theme);
        mockUseMantineColorScheme.mockReturnValue({
            colorScheme: "auto",
        });

        const { result } = renderHook(() => useRightColorShade("blue"));

        const lightShade = (theme.primaryShade as MantinePrimaryShade).light;
        expect(result.current).toBe(theme.colors.blue[lightShade]);
    });

    it("should fall back to gray when requested color is not in theme", () => {
        mockUseMantineTheme.mockReturnValue(theme);
        mockUseMantineColorScheme.mockReturnValue({
            colorScheme: "light",
        });

        const { result } = renderHook(() =>
            useRightColorShade("nonexistent-color"),
        );

        const lightShade = (theme.primaryShade as MantinePrimaryShade).light;
        expect(result.current).toBe(theme.colors.gray[lightShade]);
    });
});
