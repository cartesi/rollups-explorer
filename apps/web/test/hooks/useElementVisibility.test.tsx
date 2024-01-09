import { useIntersection } from "@mantine/hooks";
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useElementVisibility } from "../../src/hooks/useElementVisibility";

// Mock @mantine/hooks
vi.mock("@mantine/hooks", async () => {
    const actual = await vi.importActual("@mantine/hooks");
    return {
        ...(actual as any),
        useIntersection: vi.fn(),
    };
});

const mockUseIntersection = vi.mocked(useIntersection);
describe("useElementVisibility", () => {
    it("should return isVisible as true when intersection ratio is below threshold", () => {
        const element = { current: document.createElement("div") };
        mockUseIntersection.mockReturnValue({
            ref: vi.fn(),
            entry: {
                boundingClientRect: new DOMRect(),
                intersectionRatio: 0.4,
                intersectionRect: new DOMRect(),
                isIntersecting: true,
                rootBounds: new DOMRect(),
                target: document.createElement("div"),
                time: Date.now(),
            },
        });

        const { result } = renderHook(() =>
            useElementVisibility({ element, threshold: 0.5 }),
        );

        expect(result.current.isVisible).toBe(true);
    });

    it("should return isVisible as false when intersection ratio is above threshold", () => {
        const element = { current: document.createElement("div") };
        mockUseIntersection.mockReturnValue({
            ref: vi.fn(),
            entry: {
                boundingClientRect: new DOMRect(),
                intersectionRatio: 0.6,
                intersectionRect: new DOMRect(),
                isIntersecting: true,
                rootBounds: new DOMRect(),
                target: document.createElement("div"),
                time: Date.now(),
            },
        });

        const { result } = renderHook(() =>
            useElementVisibility({ element, threshold: 0.5 }),
        );

        expect(result.current.isVisible).toBe(false);
    });
});
