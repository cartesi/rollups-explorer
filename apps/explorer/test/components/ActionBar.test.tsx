import { describe, expect, it, vi } from "vitest";
import ActionBar from "../../src/components/ActionBar";
import { fireEvent, render, screen } from "../test-utils";

vi.mock("@mantine/hooks", async (importOriginal) => {
    const actual = (await importOriginal()) as object;
    return {
        ...actual,
        useDebouncedCallback: (fn: (...args: unknown[]) => void) => fn,
    };
});

describe("ActionBar", () => {
    it("emits query updates", () => {
        const onChange = vi.fn();
        render(
            <ActionBar
                initialValue={{ query: "", sortingOrder: "descending" }}
                onChange={onChange}
            />,
        );

        fireEvent.change(screen.getByPlaceholderText("Search..."), {
            target: { value: "abc" },
        });

        expect(onChange).toHaveBeenCalledWith({
            query: "abc",
            sortingOrder: "descending",
        });
    });

    it("toggles sorting order when button is clicked", () => {
        const onChange = vi.fn();
        render(
            <ActionBar
                initialValue={{ query: "q", sortingOrder: "descending" }}
                onChange={onChange}
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: /descending/i }));

        expect(onChange).toHaveBeenCalledWith({
            query: "q",
            sortingOrder: "ascending",
        });
    });
});
