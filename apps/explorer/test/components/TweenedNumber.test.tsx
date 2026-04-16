import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TweenedNumber from "../../src/components/TweenedNumber";
import { render } from "../test-utils";

describe("TweenedNumber", () => {
    it("should render the tweened value", () => {
        render(<TweenedNumber value={42} />);

        expect(screen.getByText("42")).toBeInTheDocument();
    });
});
