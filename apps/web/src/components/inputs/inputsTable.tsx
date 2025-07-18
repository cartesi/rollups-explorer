"use client";
import {
    ActionIcon,
    Button,
    Flex,
    Loader,
    Table,
    Text,
    Tooltip,
    Transition,
    useMantineColorScheme,
    useMantineTheme,
} from "@mantine/core";
import { FC, useCallback, useRef, useState } from "react";
import { TbQuestionMark } from "react-icons/tb";
import type { InputItemFragment } from "@cartesi/rollups-explorer-domain/explorer-operations";
import { useElementVisibility } from "../../hooks/useElementVisibility";
import { useConnectionConfig } from "../../providers/connectionConfig/hooks";
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
    const { listConnections } = useConnectionConfig();
    const connectionsLength = listConnections().length;

    return (
        <TableResponsiveWrapper ref={tableRowRef}>
            <Table width={"100%"} style={{ borderCollapse: "collapse" }}>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Transaction Hash</Table.Th>
                        <Table.Th>From</Table.Th>
                        <Table.Th></Table.Th>
                        <Table.Th>To</Table.Th>
                        <Table.Th>Version</Table.Th>
                        <Table.Th>Method</Table.Th>
                        <Table.Th>Index</Table.Th>
                        <Table.Th>
                            <Tooltip
                                label="Check the status by adding a connection. Click the ? in the row to add a connection."
                                disabled={connectionsLength > 0}
                            >
                                <Flex align="center">
                                    <Text size="sm" fw={600}>
                                        Status
                                    </Text>
                                    {connectionsLength === 0 && (
                                        <ActionIcon
                                            size="xs"
                                            radius={50}
                                            ml={4}
                                            data-testid="tooltip-icon"
                                        >
                                            <TbQuestionMark />
                                        </ActionIcon>
                                    )}
                                </Flex>
                            </Tooltip>
                        </Table.Th>
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
                            <Table.Td align="center" colSpan={9}>
                                <Loader data-testid="inputs-table-spinner" />
                            </Table.Td>
                        </Table.Tr>
                    ) : (
                        totalCount === 0 && (
                            <Table.Tr>
                                <Table.Td colSpan={9} align="center">
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
