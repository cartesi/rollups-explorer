import type { Application, Input } from "@cartesi/client";
import {
    Anchor,
    Card,
    Stack,
    Table,
    Text,
    Title,
    useMantineTheme,
} from "@mantine/core";
import Link from "next/link";
import type { FC } from "react";
import type { Hash } from "viem";
import { content } from "../../content";
import {
    formatRefundAsset,
    type RefundAsset,
    type RefundStatus,
} from "./lib/refundUtils";
import { pathBuilder } from "../../routes/routePathBuilder";
import Address from "../Address";
import { RefundStatusLabel } from "./RefundDepositView";

const text = content.refund.summary;

export interface RefundableDeposit {
    input: Input;
    asset: RefundAsset;
    status: RefundStatus;
    transactionHash?: Hash;
}

export interface RefundableDepositsProps {
    application: Application;

    deposits: RefundableDeposit[];

    /** How many deposits to show. Default `3`. */
    limit?: number;
}

/** Deposits a foreclosed application can refund, newest first, each linking to its epoch page. Renders nothing when empty. */
export const RefundableDeposits: FC<RefundableDepositsProps> = ({
    application,
    deposits,
    limit = 3,
}) => {
    const theme = useMantineTheme();
    const appId = application.name ?? application.applicationAddress;

    if (deposits.length === 0) return null;

    return (
        <Stack>
            <Title order={3} c="dimmed">
                {text.titleTxt}
            </Title>
            <Card shadow="md" withBorder>
                <Table verticalSpacing="sm">
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>{text.columns.inputTxt}</Table.Th>
                            <Table.Th>{text.columns.assetTxt}</Table.Th>
                            <Table.Th>{text.columns.depositorTxt}</Table.Th>
                            <Table.Th>{text.columns.epochTxt}</Table.Th>
                            <Table.Th>{text.columns.statusTxt}</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {deposits.slice(0, limit).map((deposit) => (
                            <Table.Tr key={deposit.input.index.toString()}>
                                <Table.Td>
                                    <Text fw="bold">
                                        # {deposit.input.index.toString()}
                                    </Text>
                                </Table.Td>
                                <Table.Td>
                                    {formatRefundAsset(deposit.asset)}
                                </Table.Td>
                                <Table.Td>
                                    <Address
                                        value={deposit.asset.depositor}
                                        iconSize={theme.other.smIconSize}
                                        canCopy={false}
                                        icon
                                        shorten
                                    />
                                </Table.Td>
                                <Table.Td>
                                    <Anchor
                                        component={Link}
                                        href={pathBuilder.epoch({
                                            application: appId,
                                            epochIndex:
                                                deposit.input.epochIndex,
                                        })}
                                    >
                                        # {deposit.input.epochIndex.toString()}
                                    </Anchor>
                                </Table.Td>
                                <Table.Td>
                                    <RefundStatusLabel
                                        status={deposit.status}
                                        transactionHash={
                                            deposit.transactionHash
                                        }
                                    />
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </Card>
        </Stack>
    );
};
