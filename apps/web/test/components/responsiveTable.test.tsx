import { describe, it } from "vitest";
import { render, screen } from "@testing-library/react";
import ResponsiveTable from "../../src/components/responsiveTable";
import { withMantineTheme } from "../utils/WithMantineTheme";

const Component = withMantineTheme(ResponsiveTable);

const defaultProps = {
    columns: [
        {
            key: "id",
            label: "ID",
            render: (item: any) => item.id,
        },
        {
            key: "name",
            label: "Name",
            render: (item: any) => item.name,
        },
    ],
    items: [
        {
            id: 1,
            name: "John Doe",
        },
        {
            id: 2,
            name: "Jane Doe",
        },
    ],
    totalCount: 2,
    fetching: false,
};

describe("ResponsiveTable component", () => {
    it("should display correct column labels", () => {
        render(<Component {...defaultProps} />);

        defaultProps.columns.forEach((column) => {
            expect(screen.getByText(column.label)).toBeInTheDocument();
        });
    });

    it("should display correct rows", () => {
        render(<Component {...defaultProps} />);

        defaultProps.items.forEach((item) => {
            expect(screen.getByText(item.id)).toBeInTheDocument();
            expect(screen.getByText(item.name)).toBeInTheDocument();
        });
    });

    it("should display spinner while fetching", () => {
        render(<Component {...defaultProps} fetching={true} />);
        expect(screen.getByTestId("table-spinner")).toBeInTheDocument();
    });

    it("should display empty label when total count is zero", () => {
        const emptyLabel = "No inputs found";
        render(
            <Component
                {...defaultProps}
                totalCount={0}
                emptyLabel={emptyLabel}
            />,
        );

        expect(screen.getByText(emptyLabel)).toBeInTheDocument();
    });
});
