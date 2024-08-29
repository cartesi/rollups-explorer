import { Globals } from "@react-spring/web";
import "@testing-library/jest-dom/vitest";
import { beforeAll, vi } from "vitest";

vi.stubEnv("NEXT_PUBLIC_CHAIN_ID", "11155111");

Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

window.HTMLElement.prototype.scrollIntoView = function () {};

global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

beforeAll(() => {
    Globals.assign({
        skipAnimation: true,
    });
});
