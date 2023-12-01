"use client";
import { Button, Loader, Table, Text } from "@mantine/core";
import { FC, useCallback, useState } from "react";
import Address from "./address";
import type { Address as AddressType } from "abitype/dist/types/abi";
import prettyMilliseconds from "pretty-ms";

export interface Entry {
    appId: AddressType;
    timestamp: number;
    href: string;
}

export interface InputsTableProps {
    entries: Entry[];
    fetching: boolean;
    totalCount: number;
}

const InputsTable: FC<InputsTableProps> = ({
    entries,
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
                    <Table.Th>Address</Table.Th>
                    <Table.Th>
                        <Button
                            variant="transparent"
                            px={0}
                            onClick={onChangeTimeColumnType}
                        >
                            {timeType === "age" ? "Age" : "Timestamp (UTC)"}
                        </Button>
                    </Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {fetching ? (
                    <Table.Tr>
                        <Table.Td align="center" colSpan={2}>
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
                {entries.map((entry) => (
                    <Table.Tr key={entry.appId}>
                        <Table.Td>
                            <Address
                                value={entry.appId}
                                icon
                                shorten
                                href={entry.href}
                            />
                        </Table.Td>
                        <Table.Td>
                            <Text>
                                {timeType === "age"
                                    ? `${prettyMilliseconds(
                                          Date.now() - entry.timestamp * 1000,
                                          {
                                              unitCount: 2,
                                              secondsDecimalDigits: 0,
                                              verbose: true,
                                          },
                                      )} ago`
                                    : new Date(
                                          entry.timestamp * 1000,
                                      ).toISOString()}
                            </Text>
                        </Table.Td>
                    </Table.Tr>
                ))}
            </Table.Tbody>
        </Table>
    );
};

export default InputsTable;
