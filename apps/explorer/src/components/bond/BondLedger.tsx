import type { BondEvent } from "@cartesi/client";
import {
    Badge,
    Center,
    Group,
    Pagination,
    SimpleGrid,
    Stack,
    Table,
    Text,
} from "@mantine/core";
import { useState, type FC } from "react";
import {
    formatBondValue,
    getBondTotals,
    isBondRecovery,
} from "../../lib/bondUtils";
import { content } from "../../content";
import Address from "../Address";
import { InfoHint } from "../InfoHint";
import TransactionHash from "../TransactionHash";

export interface BondLedgerProps {
    events: BondEvent[];

    /**
     * Number of events per page.
     */
    pageSize?: number;
}

const text = content.bond.ledger;

const Total: FC<{ label: string; value: string }> = ({ label, value }) => (
    <Stack gap={0}>
        <Text size="xs" c="dimmed" tt="uppercase">
            {label}
        </Text>
        <Text fw="bold">{value}</Text>
    </Stack>
);

const BondEventRow: FC<{ event: BondEvent }> = ({ event }) => (
    <Table.Tr>
        <Table.Td>{event.blockNumber.toString()}</Table.Td>
        {isBondRecovery(event) ? (
            <>
                <Table.Td>
                    <Badge color="green">{text.recoveryTxt}</Badge>
                </Table.Td>
                <Table.Td>
                    <Address
                        value={event.recovery.claimer}
                        shorten
                        iconSize={16}
                    />
                </Table.Td>
                <Table.Td>
                    <Stack gap={0}>
                        <Text size="sm">
                            {`${text.paidTxt} ${formatBondValue(event.recovery.payment)}`}
                        </Text>
                        <Text size="xs" c="dimmed">
                            {`${text.burnedTxt} ${formatBondValue(event.recovery.burned)}`}
                        </Text>
                    </Stack>
                </Table.Td>
            </>
        ) : (
            <>
                <Table.Td>
                    <Group gap={4} wrap="nowrap">
                        <Badge color={event.refund.success ? "blue" : "red"}>
                            {event.refund.success
                                ? text.gasRefundTxt
                                : text.gasRefundNotPaidTxt}
                        </Badge>
                        <InfoHint
                            label={content.bond.gasRefund.hint}
                            size={14}
                        />
                    </Group>
                </Table.Td>
                <Table.Td>
                    <Address
                        value={event.refund.recipient}
                        shorten
                        iconSize={16}
                    />
                </Table.Td>
                <Table.Td>
                    <Text
                        size="sm"
                        td={event.refund.success ? undefined : "line-through"}
                    >
                        {formatBondValue(event.refund.value)}
                    </Text>
                </Table.Td>
            </>
        )}
        <Table.Td>
            <TransactionHash transactionHash={event.txHash} />
        </Table.Td>
    </Table.Tr>
);

export const BondLedger: FC<BondLedgerProps> = ({ events, pageSize = 10 }) => {
    const [page, setPage] = useState(1);
    const totals = getBondTotals(events);
    const pages = Math.ceil(events.length / pageSize);
    const visible = events.slice((page - 1) * pageSize, page * pageSize);

    if (events.length === 0) {
        return (
            <Center>
                <Text c="dimmed">{text.noEventsTxt}</Text>
            </Center>
        );
    }

    return (
        <Stack>
            <SimpleGrid cols={{ base: 2, sm: 4 }}>
                <Total
                    label={text.totals.gasRefundedTxt}
                    value={formatBondValue(totals.refunded)}
                />
                <Total
                    label={`${text.totals.notPaidTxt} (${totals.failedRefundCount})`}
                    value={formatBondValue(totals.failedRefunds)}
                />
                <Total
                    label={text.totals.paidTxt}
                    value={formatBondValue(totals.paid)}
                />
                <Total
                    label={text.totals.burnedTxt}
                    value={formatBondValue(totals.burned)}
                />
            </SimpleGrid>
            <Table.ScrollContainer minWidth={600}>
                <Table>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>{text.columns.blockTxt}</Table.Th>
                            <Table.Th>{text.columns.typeTxt}</Table.Th>
                            <Table.Th>{text.columns.accountTxt}</Table.Th>
                            <Table.Th>{text.columns.valueTxt}</Table.Th>
                            <Table.Th>{text.columns.transactionTxt}</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {visible.map((event) => (
                            <BondEventRow
                                key={`${event.txHash}-${event.logIndex}`}
                                event={event}
                            />
                        ))}
                    </Table.Tbody>
                </Table>
            </Table.ScrollContainer>
            {pages > 1 && (
                <Group justify="center">
                    <Pagination total={pages} value={page} onChange={setPage} />
                </Group>
            )}
        </Stack>
    );
};
