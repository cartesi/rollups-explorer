"use client";
import { Badge, Box, Button, Group, Loader, Table, Text } from "@mantine/core";
import prettyMilliseconds from "pretty-ms";
import { FC, useCallback, useState } from "react";
import { TbArrowRight } from "react-icons/tb";
import type { Address as AddressType } from "viem";
import { InputItemFragment } from "../../graphql/explorer/operations";
import { methodResolver } from "../../lib/methodResolver";
import Address from "../address";

export interface Entry {
    appId: AddressType;
    timestamp: number;
    href: string;
}

export interface LatestInputsTableProps {
    inputs: InputItemFragment[];
    fetching: boolean;
    totalCount: number;
}

const LatestInputsTable: FC<LatestInputsTableProps> = ({
    inputs,
    fetching,
    totalCount,
}) => {
    const [timeType, setTimeType] = useState("age");

    const onChangeTimeColumnType = useCallback(() => {
        setTimeType((timeType) => (timeType === "age" ? "timestamp" : "age"));
    }, []);

    return (
        <Table
            width="100%"
            miw="max-content"
            style={{ borderCollapse: "collapse" }}
        >
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>From</Table.Th>
                    <Table.Th>Method</Table.Th>
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
                            <Loader data-testid="inputs-table-spinner" />
                        </Table.Td>
                    </Table.Tr>
                ) : (
                    totalCount === 0 && (
                        <Table.Tr>
                            <Table.Td colSpan={3} align="center" fw={700}>
                                No inputs
                            </Table.Td>
                        </Table.Tr>
                    )
                )}
                {inputs.map((input) => (
                    <Table.Tr key={`${input.application.id}-${input.id}`}>
                        <Table.Td>
                            <Box
                                display="flex"
                                w="max-content"
                                style={{
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                {input.erc20Deposit ? (
                                    <Group>
                                        <Address
                                            value={
                                                input.erc20Deposit
                                                    .from as AddressType
                                            }
                                            icon
                                            shorten
                                        />
                                        <TbArrowRight />
                                        <Address
                                            value={
                                                input.msgSender as AddressType
                                            }
                                            icon
                                            shorten
                                        />
                                    </Group>
                                ) : (
                                    <Address
                                        value={input.msgSender as AddressType}
                                        icon
                                        shorten
                                    />
                                )}
                            </Box>
                        </Table.Td>
                        <Table.Td>
                            <Badge
                                variant="default"
                                style={{ textTransform: "none" }}
                            >
                                {methodResolver(input) ?? "?"}
                            </Badge>
                        </Table.Td>
                        <Table.Td>
                            <Text>
                                {timeType === "age"
                                    ? `${prettyMilliseconds(
                                          Date.now() - input.timestamp * 1000,
                                          {
                                              unitCount: 2,
                                              secondsDecimalDigits: 0,
                                              verbose: true,
                                          },
                                      )} ago`
                                    : new Date(
                                          input.timestamp * 1000,
                                      ).toISOString()}
                            </Text>
                        </Table.Td>
                    </Table.Tr>
                ))}
            </Table.Tbody>
        </Table>
    );
};

export default LatestInputsTable;
