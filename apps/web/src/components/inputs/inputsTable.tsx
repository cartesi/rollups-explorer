"use client";
import {
    Button,
    Loader,
    Table,
    Text,
    Transition,
    useMantineColorScheme,
    useMantineTheme,
} from "@mantine/core";
import { FC, useCallback, useRef, useState } from "react";
import type { InputItemFragment } from "../../graphql/explorer/operations";
import { useElementVisibility } from "../../hooks/useElementVisibility";
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
    const theme = useMantineTheme();
    const { colorScheme } = useMantineColorScheme();
    const bgColor = colorScheme === "dark" ? theme.colors.dark[7] : theme.white;
    const onChangeTimeColumnType = useCallback(() => {
        setTimeType((timeType) => (timeType === "age" ? "timestamp" : "age"));
    }, []);
    const tableRowRef = useRef<HTMLDivElement>(null);
    const { childrenRef, isVisible } = useElementVisibility({
        element: tableRowRef,
    });

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
                        <Table.Th ref={childrenRef}>Data</Table.Th>
                        <Transition
                            mounted={isVisible}
                            transition="scale-x"
                            duration={500}
                            timingFunction="ease-out"
                        >
                            {(styles) => (
                                <th
                                    style={{
                                        ...styles,
                                        position: "sticky",
                                        top: 0,
                                        right: 0,
                                        backgroundColor: bgColor,
                                        padding:
                                            "var(--table-vertical-spacing) var(--table-horizontal-spacing, var(--mantine-spacing-lg))",
                                    }}
                                >
                                    Data
                                </th>
                            )}
                        </Transition>
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
                            keepDataColVisible={!isVisible}
                        />
                    ))}
                </Table.Tbody>
            </Table>
        </TableResponsiveWrapper>
    );
};

export default InputsTable;
