import { Globals } from "@react-spring/web";
import "@testing-library/jest-dom";
import { configure } from "@testing-library/react";
import { beforeAll, vi } from "vitest";

// Give waitFor/findBy* more than the default 1s, as the undeployed application warning is debounced by 1s and slower CI runners need extra room.
configure({ asyncUtilTimeout: 5000 });

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
