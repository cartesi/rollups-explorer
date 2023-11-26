"use client";
import { Table, UnstyledButton } from "@mantine/core";
import { FC, useCallback, useState } from "react";
import InputRow from "../components/inputRow";
import { InputOrderByInput, useInputsQuery } from "../graphql";
import { usePaginationParams } from "../hooks/usePaginationParams";

const Explorer: FC = (props) => {
    const [{ limit, page }, updateParams] = usePaginationParams();
    const after = page === 1 ? undefined : ((page - 1) * limit).toString();
    const [{ data, fetching }] = useInputsQuery({
        variables: {
            orderBy: InputOrderByInput.TimestampDesc,
            limit,
            after,
        },
    });
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
                {data?.inputsConnection.edges.map(({ node: input }) => (
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

export default Explorer;
