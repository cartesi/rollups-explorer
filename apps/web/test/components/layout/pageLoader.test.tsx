import { describe, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { withMantineTheme } from "../utils/WithMantineTheme";
import PageLoader from "../../src/components/layout/pageLoader";

const Component = withMantineTheme(PageLoader);

describe("PageLoader component", () => {
    it("should display spinner", () => {
        render(<Component />);
        expect(screen.getByTestId("page-spinner")).toBeInTheDocument();
    });
});
