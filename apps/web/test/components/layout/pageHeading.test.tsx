import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import PageHeading from "../../../src/components/layout/pageHeading";
import { withMantineTheme } from "../../utils/WithMantineTheme";
import { TbInbox } from "react-icons/tb";

const Component = withMantineTheme(PageHeading);

const defaultProps = {
    heading: "Applications",
    Icon: TbInbox,
};

describe("PageHeading component", () => {
    it("should display correct title", () => {
        render(<Component {...defaultProps} />);
        expect(screen.getByText(defaultProps.heading)).toBeInTheDocument();
    });

    it("should display correct icon", () => {
        const iconId = "heading-icon";
        const Icon = () => <div data-testid={iconId} />;
        render(<Component {...defaultProps} Icon={Icon} />);

        expect(screen.getByTestId(iconId)).toBeInTheDocument();
    });
});
