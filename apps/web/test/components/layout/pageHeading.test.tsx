import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import PageTitle from "../../../src/components/layout/pageTitle";
import { withMantineTheme } from "../../utils/WithMantineTheme";
import { TbInbox } from "react-icons/tb";

const Component = withMantineTheme(PageTitle);

const defaultProps = {
    title: "Applications",
    Icon: TbInbox,
};

describe("PageTitle component", () => {
    it("should display correct title", () => {
        render(<Component {...defaultProps} />);
        expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
    });

    it("should display correct icon", () => {
        const iconId = "heading-icon";
        const Icon = () => <div data-testid={iconId} />;
        render(<Component {...defaultProps} Icon={Icon} />);

        expect(screen.getByTestId(iconId)).toBeInTheDocument();
    });
});
