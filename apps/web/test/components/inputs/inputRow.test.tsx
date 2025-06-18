import { Table } from "@mantine/core";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import prettyMilliseconds from "pretty-ms";
import type { FC } from "react";
import { useQuery } from "urql";
import { afterEach, beforeEach, describe, it } from "vitest";
import InputRow, {
    InputRowProps,
} from "../../../src/components/inputs/inputRow";
import { RollupVersion } from "@cartesi/rollups-explorer-domain/explorer-types";
import { useConnectionConfig } from "../../../src/providers/connectionConfig/hooks";
import { withMantineTheme } from "../../utils/WithMantineTheme";

vi.mock("../../../src/providers/connectionConfig/hooks");
const useConnectionConfigMock = vi.mocked(useConnectionConfig, true);

vi.mock("urql");
const useQueryMock = vi.mocked(useQuery, true);

const TableComponent: FC<InputRowProps> = (props) => (
    <Table>
        <Table.Tbody>
            <InputRow {...props} />
        </Table.Tbody>
    </Table>
);

const Component = withMantineTheme(TableComponent);

const defaultProps: InputRowProps = {
    input: {
        id: "11155111-0xdb84080e7d2b4654a7e384de851a6cf7281643de-1",
        application: {
            id: `11155111-0xdb84080e7d2b4654a7e384de851a6cf7281643de`,
            address: "0xdb84080e7d2b4654a7e384de851a6cf7281643de",
            rollupVersion: RollupVersion.V1,
        },
        index: 1,
        payload: "0x68656c6c6f2032",
        msgSender: "0x8a12cf75000cd2e73ab16469826838d5f137f444",
        timestamp: 1700593992,
        transactionHash:
            "0x4ad73b8f46dc16bc27d75b3f8f584e8785a8cb6fdf97a6c2a5a5dcfbda3e75c0",
        erc20Deposit: null,
        chain: {
            id: "11155111",
        },
    },
    timeType: "age",
    keepDataColVisible: false,
};

const defaultInputStatusData = {
    input: {
        status: "ACTIVE",
    },
};

describe("InputRow component", () => {
    beforeEach(() => {
        useConnectionConfigMock.mockReturnValue({
            getConnection: () => vi.fn(),
            hasConnection: () => vi.fn(),
            showConnectionModal: () => vi.fn(),
        } as any);

        useQueryMock.mockReturnValue([
            {
                fetching: false,
                data: defaultInputStatusData,
            },
        ] as any);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("should display correct age", () => {
        render(<Component {...defaultProps} />);

        const age = `${prettyMilliseconds(
            Date.now() - defaultProps.input.timestamp * 1000,
            {
                unitCount: 2,
                secondsDecimalDigits: 0,
                verbose: true,
            },
        )} ago`;
        expect(screen.getByText(age)).toBeInTheDocument();
    });

    it("should display correct timestamp in UTC format", () => {
        render(
            <Component
                input={defaultProps.input}
                timeType="timestamp"
                keepDataColVisible={false}
            />,
        );

        const timestamp = new Date(
            defaultProps.input.timestamp * 1000,
        ).toISOString();
        expect(screen.getByText(timestamp)).toBeInTheDocument();
    });

    it("should display correct action icon and tooltip when no connection is set", async () => {
        useConnectionConfigMock.mockReturnValue({
            getConnection: () => vi.fn(),
            hasConnection: () => false,
            showConnectionModal: () => vi.fn(),
        } as any);
        render(<Component {...defaultProps} />);

        const button = screen.getByTestId("show-connection-modal");
        expect(button).toBeInTheDocument();

        fireEvent.mouseEnter(button);
        await waitFor(() =>
            expect(
                screen.getByText(
                    "Click to add a connection and inspect the input status.",
                ),
            ).toBeInTheDocument(),
        );
    });

    it("should invoke connection modal when action icon is clicked", async () => {
        const showConnectionModalMock = vi.fn();
        useConnectionConfigMock.mockReturnValue({
            getConnection: () => vi.fn(),
            hasConnection: () => false,
            showConnectionModal: showConnectionModalMock,
        } as any);
        render(<Component {...defaultProps} />);

        const button = screen.getByTestId("show-connection-modal");
        fireEvent.click(button);
        expect(showConnectionModalMock).toHaveBeenCalled();
    });

    it("should display input status when connection is set", async () => {
        useConnectionConfigMock.mockReturnValue({
            getConnection: () => ({
                graphqlUrl: "https://drawingcanvas.fly.dev/graphql",
                index: 0,
            }),
            hasConnection: () => true,
            showConnectionModal: () => vi.fn(),
        } as any);
        render(<Component {...defaultProps} />);
        expect(
            screen.getByText(defaultInputStatusData.input.status),
        ).toBeInTheDocument();
    });
});
