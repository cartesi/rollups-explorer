import { afterEach, beforeEach, describe, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { withMantineTheme } from "../../utils/WithMantineTheme";
import ConnectionSummary, {
    ConnectionSummaryProps,
} from "../../../src/components/connection/connectionSummary";
import { useQuery } from "urql";
import { connectionSummaryResult } from "./mocks";
import { FC } from "react";
import { Grid } from "@mantine/core";

vi.mock("urql");
const useQueryMock = vi.mocked(useQuery, true);

const GridComponent: FC<ConnectionSummaryProps> = (props) => (
    <Grid>
        <ConnectionSummary {...props} />
    </Grid>
);

const Component = withMantineTheme(GridComponent);

const defaultProps = {
    url: "http://localhost:3000/graphql",
};

describe("ConnectionSummary component", () => {
    beforeEach(() => {
        useQueryMock.mockReturnValue([
            {
                data: connectionSummaryResult.data,
                fetching: false,
            },
        ] as any);
    });

    afterEach(() => {
        vi.clearAllMocks();
        cleanup();
    });

    it("should display summary card for notices", () => {
        render(<Component {...defaultProps} />);
        expect(screen.getByText("Notices")).toBeInTheDocument();
        expect(
            screen.getByText(connectionSummaryResult.data.notices.totalCount),
        ).toBeInTheDocument();
    });

    it("should display summary card for vouchers", () => {
        render(<Component {...defaultProps} />);
        expect(screen.getByText("Vouchers")).toBeInTheDocument();
        expect(
            screen.getByText(connectionSummaryResult.data.vouchers.totalCount),
        ).toBeInTheDocument();
    });

    it("should display summary card for reports", () => {
        render(<Component {...defaultProps} />);
        expect(screen.getByText("Reports")).toBeInTheDocument();
        expect(
            screen.getByText(connectionSummaryResult.data.reports.totalCount),
        ).toBeInTheDocument();
    });
});
