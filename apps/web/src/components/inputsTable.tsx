"use client";
import { Button, Loader, Table } from "@mantine/core";
import { FC, useCallback, useState } from "react";
import InputRow from "../components/inputRow";
import type { InputItemFragment } from "../graphql";

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
                            <Loader />
                        </Table.Td>
                    </Table.Tr>
                ) : (
                    totalCount === 0 && (
                        <Table.Tr>
                            <Table.Td colSpan={3} align="center">
                                No inputs
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
    );
};

export default InputsTable;
