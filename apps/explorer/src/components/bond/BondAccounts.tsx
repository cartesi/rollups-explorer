import { Table, Text } from "@mantine/core";
import type { FC } from "react";
import { content } from "../../content";
import { formatBondValue, type BondAccount } from "../../lib/bondUtils";
import Address from "../Address";

export interface BondAccountsProps {
    accounts: BondAccount[];
}

const text = content.bond.accounts.columns;

const byMovedValue = (a: BondAccount, b: BondAccount) => {
    const difference = b.refunded + b.paid - (a.refunded + a.paid);
    return difference > 0n ? 1 : difference < 0n ? -1 : 0;
};

export const BondAccounts: FC<BondAccountsProps> = ({ accounts }) => (
    <Table.ScrollContainer minWidth={600}>
        <Table>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>{text.accountTxt}</Table.Th>
                    <Table.Th>{text.eventsTxt}</Table.Th>
                    <Table.Th>{text.gasRefundedTxt}</Table.Th>
                    <Table.Th>{text.notPaidTxt}</Table.Th>
                    <Table.Th>{text.recoveredTxt}</Table.Th>
                    <Table.Th>{text.burnedTxt}</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {[...accounts].sort(byMovedValue).map((account) => (
                    <Table.Tr key={account.account}>
                        <Table.Td>
                            <Address
                                value={account.account}
                                shorten
                                iconSize={16}
                            />
                        </Table.Td>
                        <Table.Td>{account.events}</Table.Td>
                        <Table.Td>{formatBondValue(account.refunded)}</Table.Td>
                        <Table.Td>
                            <Text size="sm" c="dimmed">
                                {formatBondValue(account.failedRefunds)}
                            </Text>
                        </Table.Td>
                        <Table.Td>{formatBondValue(account.paid)}</Table.Td>
                        <Table.Td>{formatBondValue(account.burned)}</Table.Td>
                    </Table.Tr>
                ))}
            </Table.Tbody>
        </Table>
    </Table.ScrollContainer>
);
