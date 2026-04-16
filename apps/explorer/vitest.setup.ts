// Add here any common setup for tests to avoid repetition in each file.
import { Globals } from "@react-spring/web";
import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, vi } from "vitest";

beforeAll(() => {
    Globals.assign({
        skipAnimation: true,
    });
});

// Automatically unmount and cleanup DOM after the test is finished.
afterEach(() => {
    cleanup();
});

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

// Mocking console methods to prevent cluttering test output with logs, warnings, and errors.
// This is especially useful when testing components that may trigger console output.
// Note: If you want to see the console output for debugging purposes, you can override these mocks in specific tests.
vi.spyOn(console, "log").mockImplementation(() => {});
vi.spyOn(console, "error").mockImplementation(() => {});
vi.spyOn(console, "warn").mockImplementation(() => {});
vi.spyOn(console, "info").mockImplementation(() => {});
