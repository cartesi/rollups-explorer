import { useMantineColorScheme } from "@mantine/core";
import { describe, expect, it, vi } from "vitest";
import { ThemeToggle } from "../../src/components/ThemeToggle";
import { fireEvent, render, screen } from "../test-utils";

vi.mock("@mantine/core", async () => {
    const actual =
        await vi.importActual<typeof import("@mantine/core")>("@mantine/core");
    return {
        ...actual,
        useMantineColorScheme: vi.fn(),
    };
});

const mockUseMantineColorScheme = vi.mocked(useMantineColorScheme, {
    partial: true,
});

describe("ThemeToggle component", () => {
    it("should toggle theme when changed", () => {
        const toggle = vi.fn();
        mockUseMantineColorScheme.mockReturnValue({
            colorScheme: "light",
            toggleColorScheme: toggle,
        });

        render(<ThemeToggle />);

        fireEvent.click(screen.getByText("Light Mode"));
        expect(toggle).toHaveBeenCalled();
    });

    it("should be checked when color scheme is dark", () => {
        mockUseMantineColorScheme.mockReturnValue({
            colorScheme: "dark",
            toggleColorScheme: vi.fn(),
        });

        render(<ThemeToggle />);

        expect(screen.getByText("Dark Mode")).toBeInTheDocument();
        expect(screen.getByText("on")).toBeVisible();
    });
});
