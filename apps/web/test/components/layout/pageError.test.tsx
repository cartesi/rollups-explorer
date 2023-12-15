import { describe, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { withMantineTheme } from "../utils/WithMantineTheme";
import PageError from "../../src/components/layout/pageError";

const Component = withMantineTheme(PageError);
const props = {
    reset: () => undefined,
};

describe("PageError component", () => {
    it("should display correct heading", () => {
        render(<Component {...props} />);
        expect(screen.getByText("Something went wrong!")).toBeInTheDocument();
    });

    it("should display correct button text", () => {
        render(<Component {...props} />);
        expect(screen.getByText("Try again")).toBeInTheDocument();
    });

    it("should invoke reset function when button is clicked", () => {
        const mockedReset = vi.fn();
        render(<Component reset={mockedReset} />);

        const button = screen.getByText("Try again")
            .parentElement as HTMLButtonElement;
        fireEvent.click(button);

        expect(mockedReset).toHaveBeenCalled();
    });
});
