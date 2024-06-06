"use client";
import { Button, Loader, Table, Text } from "@mantine/core";
import { FC, useCallback, useState } from "react";
import type { InputItemFragment } from "../../graphql/explorer/operations";
import TableResponsiveWrapper from "../tableResponsiveWrapper";
import InputRow from "./inputRow";

export interface InputsTableProps {
    inputs: InputItemFragment[];
    fetching: boolean;
    totalCount: number;
}

const InputsTable: FC<InputsTableProps> = ({
    inputs,
    fetching,
    totalCount,
}) => {
    const [timeType, setTimeType] = useState("age");
    const onChangeTimeColumnType = useCallback(() => {
        setTimeType((timeType) => (timeType === "age" ? "timestamp" : "age"));
    }, []);

    return (
        <TableResponsiveWrapper>
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>From</Table.Th>
                        <Table.Th></Table.Th>
                        <Table.Th>To</Table.Th>
                        <Table.Th>Method</Table.Th>
                        <Table.Th>Index</Table.Th>
                        <Table.Th>
                            <Button
                                variant="transparent"
                                px={0}
                                onClick={onChangeTimeColumnType}
                            >
                                {timeType === "age" ? "Age" : "Timestamp (UTC)"}
                            </Button>
                        </Table.Th>
                        <Table.Th>Data</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {fetching ? (
                        <Table.Tr>
                            <Table.Td align="center" colSpan={7}>
                                <Loader data-testid="inputs-table-spinner" />
                            </Table.Td>
                        </Table.Tr>
                    ) : (
                        totalCount === 0 && (
                            <Table.Tr>
                                <Table.Td colSpan={7} align="center">
                                    <Text fw={700}> No inputs</Text>
                                </Table.Td>
                            </Table.Tr>
                        )
                    )}
                    {inputs.map((input) => (
                        <InputRow
                            key={input.id}
                            input={input}
                            timeType={timeType}
                        />
                    ))}
                </Table.Tbody>
            </Table>
        </TableResponsiveWrapper>
    );
};

export default InputsTable;
