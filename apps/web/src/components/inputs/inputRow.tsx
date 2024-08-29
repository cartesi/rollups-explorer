"use client";
import {
    ActionIcon,
    Badge,
    Box,
    Collapse,
    Group,
    Paper,
    Table,
    Text,
    Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import prettyMilliseconds from "pretty-ms";
import { FC } from "react";
import { TbArrowRight, TbFileText, TbQuestionMark, TbX } from "react-icons/tb";
import { Address as AddressType, formatUnits } from "viem";
import { InputItemFragment } from "../../graphql/explorer/operations";
import { methodResolver } from "../../lib/methodResolver";
import { useConnectionConfig } from "../../providers/connectionConfig/hooks";
import { Connection } from "../../providers/connectionConfig/types";
import Address from "../address";
import ConnectionInputStatusBadge from "../connection/connectionInputStatusBadge";
import InputDetailsView from "./inputDetailsView";

export type InputRowProps = {
    input: InputItemFragment;
    timeType: string;
    keepDataColVisible: boolean;
};

const InputRow: FC<InputRowProps> = ({
    input,
    timeType,
    keepDataColVisible,
}) => {
    const [opened, { toggle }] = useDisclosure(false);
    const from = input.msgSender as AddressType;
    const to = input.application.address as AddressType;
    const { getConnection, hasConnection, showConnectionModal } =
        useConnectionConfig();

    const erc20Deposit = (input: InputItemFragment) =>
        input.erc20Deposit ? (
            <Text size="xs">
                {formatUnits(
                    input.erc20Deposit.amount,
                    input.erc20Deposit.token.decimals,
                )}{" "}
                {input.erc20Deposit.token.symbol}
            </Text>
        ) : (
            <></>
        );

    const method = (
        <Badge variant="default" style={{ textTransform: "none" }}>
            {methodResolver(input) ?? "?"}
        </Badge>
    );
    return (
        <>
            <Table.Tr>
                <Table.Td>
                    <Box
                        display="flex"
                        w="max-content"
                        style={{
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                        data-testid="application-from-address"
                    >
                        {input.erc20Deposit ? (
                            <Group>
                                <Address
                                    value={
                                        input.erc20Deposit.from as AddressType
                                    }
                                    icon
                                    shorten
                                />
                                <TbArrowRight />
                                <Address value={from} icon shorten />
                            </Group>
                        ) : (
                            <Address value={from} icon shorten />
                        )}
                    </Box>
                </Table.Td>
                <Table.Td>
                    <Box
                        display="flex"
                        w="max-content"
                        style={{
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Group justify="right">
                            {erc20Deposit(input)}
                            <TbArrowRight />
                        </Group>
                    </Box>
                </Table.Td>
                <Table.Td>
                    <Box
                        display="flex"
                        w="max-content"
                        style={{
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                        data-testid="application-inputs-link"
                    >
                        <Address
                            value={to}
                            icon
                            href={`/applications/${to}/inputs`}
                            shorten
                        />
                    </Box>
                </Table.Td>
                <Table.Td>{method}</Table.Td>
                <Table.Td>
                    <Text>{input.index}</Text>
                </Table.Td>
                <Table.Td>
                    {hasConnection(to) ? (
                        <ConnectionInputStatusBadge
                            graphqlUrl={(getConnection(to) as Connection).url}
                            index={input.index}
                        />
                    ) : (
                        <Tooltip label="Click to add a connection and inspect the input status.">
                            <ActionIcon
                                size="xs"
                                radius={50}
                                ml={4}
                                data-testid="show-connection-modal"
                                onClick={() => showConnectionModal(to)}
                            >
                                <TbQuestionMark />
                            </ActionIcon>
                        </Tooltip>
                    )}
                </Table.Td>
                <Table.Td>
                    <Box
                        display="flex"
                        w="max-content"
                        style={{
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
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
                    </Box>
                </Table.Td>
                <Table.Td
                    pos={keepDataColVisible ? "initial" : "sticky"}
                    top={0}
                    right={0}
                    p={0}
                >
                    <Paper
                        shadow={keepDataColVisible ? undefined : "xl"}
                        radius={0}
                        p="var(--table-vertical-spacing) var(--table-horizontal-spacing, var(--mantine-spacing-xs))"
                        data-testid="input-row-toggle"
                    >
                        <ActionIcon
                            variant="default"
                            data-testid="input-row-toggle"
                            onClick={toggle}
                        >
                            {opened ? <TbX /> : <TbFileText />}
                        </ActionIcon>
                    </Paper>
                </Table.Td>
            </Table.Tr>
            <Table.Tr></Table.Tr>
            <Table.Tr>
                <Table.Td colSpan={8} p={0}>
                    <Collapse in={opened}>
                        {opened && <InputDetailsView input={input} />}
                    </Collapse>
                </Table.Td>
            </Table.Tr>
        </>
    );
};

export default InputRow;
