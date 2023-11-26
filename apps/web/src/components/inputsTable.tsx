"use client";
import { Table, UnstyledButton } from "@mantine/core";
import { FC, useCallback, useState } from "react";
import InputRow from "../components/inputRow";
import type { InputItemFragment } from "../graphql";

export interface InputsTableProps {
    inputs: InputItemFragment[];
}

const InputsTable: FC<InputsTableProps> = ({ inputs }) => {
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
                        <UnstyledButton
                            c="cyan"
                            style={{
                                fontSize: "var(--mantine-font-size-sm)",
                            }}
                            onClick={onChangeTimeColumnType}
                        >
                            {timeType === "age" ? "Age" : "Timestamp (UTC)"}
                        </UnstyledButton>
                    </Table.Th>
                    <Table.Th>Data</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
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
