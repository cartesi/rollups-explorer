import { Table } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import prettyMilliseconds from "pretty-ms";
import type { FC } from "react";
import { describe, it } from "vitest";
import InputRow, {
    InputRowProps,
} from "../../../src/components/inputs/inputRow";
import { withMantineTheme } from "../../utils/WithMantineTheme";

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
        id: "0xdb84080e7d2b4654a7e384de851a6cf7281643de-1",
        application: {
            id: "0xdb84080e7d2b4654a7e384de851a6cf7281643de",
        },
        index: 1,
        payload: "0x68656c6c6f2032",
        msgSender: "0x8a12cf75000cd2e73ab16469826838d5f137f444",
        timestamp: 1700593992,
        transactionHash:
            "0x4ad73b8f46dc16bc27d75b3f8f584e8785a8cb6fdf97a6c2a5a5dcfbda3e75c0",
        erc20Deposit: null,
    },
    timeType: "age",
    keepDataColVisible: false,
};

describe("InputRow component", () => {
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
});
