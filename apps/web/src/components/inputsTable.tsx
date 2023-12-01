"use client";
import {
    Button,
    Loader,
    Table,
    useMantineColorScheme,
    useMantineTheme,
} from "@mantine/core";
import { useIntersection } from "@mantine/hooks";
import { FC, useCallback, useRef, useState } from "react";
import InputRow from "../components/inputRow";
import type { InputItemFragment } from "../graphql";
import { TableResponsiveWrapper } from "./tableResponsiveWrapper";

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
    const theme = useMantineTheme();
    const { colorScheme } = useMantineColorScheme();
    const bgColor = colorScheme === "dark" ? theme.colors.dark[7] : theme.white;
    const onChangeTimeColumnType = useCallback(() => {
        setTimeType((timeType) => (timeType === "age" ? "timestamp" : "age"));
    }, []);
    const tableRowRef = useRef<HTMLDivElement>(null);
    const { ref, entry } = useIntersection({
        root: tableRowRef.current,
        rootMargin: "20px",
        threshold: 0.5,
    });
    const isVisible = (entry?.intersectionRatio ?? 10) < 0.5;

    return (
        <TableResponsiveWrapper ref={tableRowRef}>
            <Table width={"100%"} style={{ borderCollapse: "collapse" }}>
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
                        <Table.Th ref={ref}>Data</Table.Th>
                        <Table.Th>
                            <Button>
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
                            keepDataColVisible={!isVisible}
                        />
                    ))}
                </Table.Tbody>
            </Table>
        </TableResponsiveWrapper>
    );
};

export default InputsTable;
