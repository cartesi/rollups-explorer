import { describe, expect, it } from "vitest";
import CenteredText from "../../src/components/CenteredText";
import { render, screen } from "../test-utils";

describe("CenteredText Component", () => {
    it("should render the provided text", () => {
        render(<CenteredText text="Hello World!" />);

        expect(screen.getByText("Hello World!")).toBeInTheDocument();
    });
});
