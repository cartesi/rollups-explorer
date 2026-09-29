import type { Commitment } from "@cartesi/client";
import { Group, Skeleton, Stack, Text } from "@mantine/core";
import type { FC } from "react";
import type { Hash } from "viem";
import { content } from "../../content";
import { formatBondValue, type JoinBond } from "../../lib/bondUtils";
import Address from "../Address";
import { ClaimText } from "../ClaimText";
import { InfoHint } from "../InfoHint";
import TransactionHash from "../TransactionHash";

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
        <Text size="sm">{formatBondValue(bond.value)}</Text>
    ) : (
        <Group gap={4} wrap="nowrap">
            <Text size="sm">{`${text.atLeastTxt} ${formatBondValue(bond.value)}`}</Text>
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
    <Stack gap="xs">
        {commitments.map((commitment) => {
            const bond = bonds?.get(commitment.commitment);
            return (
                <Group key={commitment.commitment} gap="sm">
                    <ClaimText
                        claim={{ hash: commitment.commitment }}
                        iconSize={24}
                        copyButton={false}
                    />
                    <Group gap={6} wrap="nowrap">
                        <Text size="sm" c="dimmed">
                            {text.depositorTxt}
                        </Text>
                        <Address
                            value={commitment.submitterAddress}
                            iconSize={20}
                            fw={500}
                            shorten
                        />
                    </Group>
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
                    <TransactionHash transactionHash={commitment.txHash} />
                </Group>
            );
        })}
    </Stack>
);
