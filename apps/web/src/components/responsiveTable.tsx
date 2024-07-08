import React, { Fragment, PropsWithChildren, ReactNode, useRef } from "react";
import {
    Loader,
    Paper,
    Table,
    Text,
    Transition,
    useMantineColorScheme,
    useMantineTheme,
} from "@mantine/core";
import TableResponsiveWrapper from "./tableResponsiveWrapper";
import { useElementVisibility } from "../hooks/useElementVisibility";

export interface Column<T> {
    key: string;
    label: ReactNode;
    sticky?: boolean;
    render: (item: T) => ReactNode;
}

interface ResponsiveTableProps<T> {
    columns: Column<T>[];
    items: T[];
    totalCount: number;
    fetching: boolean;
    emptyLabel?: string;
}

const ResponsiveTable = <T extends { id: string | number }>(
    props: PropsWithChildren<ResponsiveTableProps<T>>,
) => {
    const {
        columns,
        items,
        totalCount,
        fetching,
        emptyLabel = "No entries found",
    } = props;
    const tableRowRef = useRef<HTMLDivElement>(null);
    const theme = useMantineTheme();
    const { colorScheme } = useMantineColorScheme();
    const bgColor = colorScheme === "dark" ? theme.colors.dark[7] : theme.white;
    const { childrenRef, isVisible } = useElementVisibility({
        element: tableRowRef,
    });

    return (
        <TableResponsiveWrapper ref={tableRowRef}>
            <Table
                width={"100%"}
                style={{ borderCollapse: "collapse" }}
                data-testid="applications-table"
            >
                <Table.Thead>
                    <Table.Tr>
                        {columns.map((column) => (
                            <Fragment key={column.key}>
                                <Table.Th
                                    ref={column.sticky ? childrenRef : null}
                                >
                                    {column.label}
                                </Table.Th>
                                {column.sticky && (
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
                                                {column.label}
                                            </th>
                                        )}
                                    </Transition>
                                )}
                            </Fragment>
                        ))}
                    </Table.Tr>
                </Table.Thead>

                <Table.Tbody>
                    {fetching ? (
                        <Table.Tr>
                            <Table.Td align="center" colSpan={columns.length}>
                                <Loader data-testid="table-spinner" />
                            </Table.Td>
                        </Table.Tr>
                    ) : (
                        totalCount === 0 && (
                            <Table.Tr>
                                <Table.Td
                                    colSpan={columns.length}
                                    align="center"
                                >
                                    <Text fw={700}>{emptyLabel}</Text>
                                </Table.Td>
                            </Table.Tr>
                        )
                    )}

                    {items.map((item) => (
                        <Table.Tr key={item.id}>
                            {columns.map((column) => (
                                <Fragment key={`${item.id}-${column.key}`}>
                                    {column.sticky ? (
                                        <Table.Td
                                            pos={
                                                isVisible ? "sticky" : "initial"
                                            }
                                            top={0}
                                            right={0}
                                            p={0}
                                        >
                                            <Paper
                                                shadow={
                                                    isVisible ? "xl" : undefined
                                                }
                                                radius={0}
                                                p="var(--table-vertical-spacing) var(--table-horizontal-spacing, var(--mantine-spacing-xs))"
                                            >
                                                {column.render(item)}
                                            </Paper>
                                        </Table.Td>
                                    ) : (
                                        <Table.Td>
                                            {column.render(item)}
                                        </Table.Td>
                                    )}
                                </Fragment>
                            ))}
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </TableResponsiveWrapper>
    );
};

export default ResponsiveTable;
