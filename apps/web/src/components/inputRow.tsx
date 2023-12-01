"use client";
import { erc20PortalAddress, etherPortalAddress } from "@cartesi/rollups-wagmi";
import {
    ActionIcon,
    Badge,
    Box,
    Collapse,
    Group,
    Paper,
    Table,
    Text,
    useMantineColorScheme,
    useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import prettyMilliseconds from "pretty-ms";
import { FC } from "react";
import { TbArrowRight, TbFileText, TbX } from "react-icons/tb";
import { Address as AddressType, formatUnits, getAddress } from "viem";
import { InputItemFragment } from "../graphql";
import Address from "./address";
import InputDetailsView from "./inputDetailsView";

export type InputRowProps = {
    input: InputItemFragment;
    timeType: string;
    keepDataColVisible: boolean;
};

export type MethodResolver = (
    input: InputItemFragment,
) => string | undefined | false;

const etherDepositResolver: MethodResolver = (input) =>
    getAddress(input.msgSender) === etherPortalAddress && "depositEther";
const erc20PortalResolver: MethodResolver = (input) =>
    getAddress(input.msgSender) === erc20PortalAddress && "depositERC20Tokens";

const resolvers: MethodResolver[] = [etherDepositResolver, erc20PortalResolver];
const methodResolver: MethodResolver = (input) => {
    for (const resolver of resolvers) {
        const method = resolver(input);
        if (method) return method;
    }
    return undefined;
};

const InputRow: FC<InputRowProps> = ({
    input,
    timeType,
    keepDataColVisible,
}) => {
    const theme = useMantineTheme();
    const { colorScheme } = useMantineColorScheme();
    const bgColor = colorScheme === "dark" ? theme.colors.dark[7] : theme.white;
    const [opened, { toggle }] = useDisclosure(false);
    const from = input.msgSender as AddressType;
    const to = input.application.id as AddressType;

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
                    {input.erc20Deposit ? (
                        <Box style={{ minWidth: "max-content" }}>
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
                        </Box>
                    ) : (
                        <Address value={from} icon shorten />
                    )}
                </Table.Td>
                <Table.Td>
                    <Box style={{ minWidth: "max-content" }}>
                        <Group justify="right">
                            {erc20Deposit(input)}
                            <TbArrowRight />
                        </Group>
                    </Box>
                </Table.Td>
                <Table.Td>
                    <Box style={{ minWidth: "320px" }}>
                        <Address
                            value={to}
                            icon
                            href={`/applications/${to}`}
                            shorten
                        />
                    </Box>
                </Table.Td>
                <Table.Td>{method}</Table.Td>
                <Table.Td>
                    <Text>{input.index}</Text>
                </Table.Td>
                <Table.Td>
                    <Box style={{ minWidth: "max-content" }}>
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
                    bg={bgColor}
                    p={keepDataColVisible ? theme.spacing.xs : 0}
                >
                    {keepDataColVisible ? (
                        <ActionIcon variant="default" onClick={toggle}>
                            {opened ? <TbX /> : <TbFileText />}
                        </ActionIcon>
                    ) : (
                        <Paper shadow="xl" p={"lg"}>
                            <ActionIcon variant="default" onClick={toggle}>
                                {opened ? <TbX /> : <TbFileText />}
                            </ActionIcon>
                        </Paper>
                    )}
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
