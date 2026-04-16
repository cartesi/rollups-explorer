// Add here any common setup for tests to avoid repetition in each file.
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Automatically unmount and cleanup DOM after the test is finished.
afterEach(() => {
    cleanup();
});
