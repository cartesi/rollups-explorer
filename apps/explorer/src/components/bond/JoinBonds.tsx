import type { Commitment } from "@cartesi/client";
import { Box, Group, Skeleton, Table, Text } from "@mantine/core";
import type { FC } from "react";
import type { Hash } from "viem";
import { content } from "../../content";
import { formatBondValue, type JoinBond } from "../../lib/bondUtils";
import Address from "../Address";
import { ClaimText } from "../ClaimText";
import { InfoHint } from "../InfoHint";
import TransactionHash from "../TransactionHash";
import style from "./JoinBonds.module.css";

const text = content.bond.join;

export interface JoinBondsProps {
    /**
     * Join bonds by commitment, filled as they resolve.
     */
    bonds?: Map<Hash, JoinBond>;

    /**
     * The commitments that posted the bonds.
     */
    commitments: Commitment[];

    /**
     * Whether the bond amounts are still being fetched.
     */
    loading?: boolean;
}

const BondValue: FC<{ bond: JoinBond }> = ({ bond }) =>
    bond.exact ? (
        <Text size="sm" c="cyan" fw={500}>
            {formatBondValue(bond.value)}
        </Text>
    ) : (
        <Group gap={4} wrap="nowrap">
            <Text size="sm" c="warning" fw={500}>
                {`${text.atLeastTxt} ${formatBondValue(bond.value)}`}
            </Text>
            <InfoHint label={text.atLeastHint} size={14} />
        </Group>
    );

/**
 * The bond each claim posted when it joined, with the account that deposited
 * it.
 */
export const JoinBonds: FC<JoinBondsProps> = ({
    bonds,
    commitments,
    loading,
}) => (
    <Box className={style.container}>
        <Table>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>{text.columns.claimTxt}</Table.Th>
                    <Table.Th>
                        <Group gap={4} wrap="nowrap">
                            {text.columns.depositorTxt}
                            <InfoHint label={text.depositorHint} size={14} />
                        </Group>
                    </Table.Th>
                    <Table.Th>{text.columns.amountTxt}</Table.Th>
                    <Table.Th>{text.columns.transactionTxt}</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {commitments.map((commitment) => {
                    const bond = bonds?.get(commitment.commitment);
                    return (
                        <Table.Tr key={commitment.commitment}>
                            <Table.Td>
                                <ClaimText
                                    claim={{ hash: commitment.commitment }}
                                    iconSize={24}
                                    copyButton={false}
                                />
                            </Table.Td>
                            <Table.Td>
                                <Address
                                    value={commitment.submitterAddress}
                                    iconSize={20}
                                    fw={500}
                                    shorten
                                />
                            </Table.Td>
                            <Table.Td>
                                {bond ? (
                                    <BondValue bond={bond} />
                                ) : loading ? (
                                    <Skeleton
                                        h={10}
                                        w={96}
                                        radius="xl"
                                        data-testid="join-bond-loading"
                                    />
                                ) : null}
                            </Table.Td>
                            <Table.Td>
                                <TransactionHash
                                    transactionHash={commitment.txHash}
                                />
                            </Table.Td>
                        </Table.Tr>
                    );
                })}
            </Table.Tbody>
        </Table>
    </Box>
);
