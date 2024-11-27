import { fireEvent, render, screen } from "@testing-library/react";
import { describe, it } from "vitest";
import RollupVersionSegment from "../src/RollupVersionSegment";
import withMantineTheme from "./utils/WithMantineTheme";

const Component = withMantineTheme(RollupVersionSegment);

describe("Rollup Version component", () => {
    it("should display the available version options", () => {
        const onChange = vi.fn();
        render(
            <Component
                label="Choose your rollup version"
                onChange={onChange}
                data-testid="rollup-version-segment"
                value=""
            />,
        );

        expect(screen.getByText("Rollup v1")).toBeVisible();
        expect(screen.getByText("Rollup v2")).toBeVisible();
    });

    it("should dispatch selected version i.e. v1 or v2", () => {
        const onChange = vi.fn();
        render(
            <Component
                label="Choose your rollup version"
                onChange={onChange}
                value=""
            />,
        );

        fireEvent.click(screen.getByText("Rollup v1"));

        expect(onChange).toHaveBeenCalledWith("v1");

        fireEvent.click(screen.getByText("Rollup v2"));

        expect(onChange).toHaveBeenCalledWith("v2");
    });
});
