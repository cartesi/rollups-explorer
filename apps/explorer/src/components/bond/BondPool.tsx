import {
    Group,
    Progress,
    Skeleton,
    Stack,
    Text,
    Tooltip,
    type MantineColor,
    type ProgressRootProps,
} from "@mantine/core";
import type { FC, ReactNode } from "react";
import { content } from "../../content";
import { formatBondValue, type BondPool as Pool } from "../../lib/bondUtils";
import { DetailRow } from "../DetailRow";

const text = content.bond.pool;

export interface BondPoolProps {
    /**
     * Current balance of the tournament contract.
     */
    balance?: bigint;

    /**
     * Minimum bond each join must post.
     */
    bondValue?: bigint;

    /**
     * Whether the bond value, join bonds or balance are still being fetched.
     */
    loading?: boolean;

    /**
     * Money in and out of the tournament.
     */
    pool: Pool;
}

const Loading = () => <Skeleton h={10} w={96} radius="xl" />;

const Value: FC<{ value?: ReactNode; loading?: boolean }> = ({
    value,
    loading,
}) =>
    value !== undefined ? <>{value}</> : loading ? <Loading /> : <Text>-</Text>;

const count = (value: number, one: string, many: string) =>
    `${value} ${value === 1 ? one : many}`;

export type BondSplitBarProps = Pick<BondPoolProps, "balance" | "pool"> &
    Omit<ProgressRootProps, "children">;

/**
 * A bar splitting where the tournament bonds went: the balance left, the gas
 * refunds, the winner payment and the burned residual.
 * @returns nothing until the balance is known and some money moved.
 */
export const BondSplitBar: FC<BondSplitBarProps> = ({
    balance,
    pool,
    ...props
}) => {
    const sections: { label: string; value: bigint; color: MantineColor }[] = [
        { label: text.split.balanceTxt, value: balance ?? 0n, color: "blue" },
        {
            label: text.split.refundedTxt,
            value: pool.refunded,
            color: "orange",
        },
        { label: text.split.paidTxt, value: pool.paid, color: "teal" },
        { label: text.split.burnedTxt, value: pool.burned, color: "gray" },
    ];
    const total = sections.reduce((sum, { value }) => sum + value, 0n);
    if (balance === undefined || total === 0n) return null;

    return (
        <Progress.Root size="sm" w={260} aria-label={text.splitTxt} {...props}>
            {sections
                .filter(({ value }) => value > 0n)
                .map(({ label, value, color }) => (
                    <Tooltip
                        key={label}
                        label={`${label}: ${formatBondValue(value)}`}
                    >
                        <Progress.Section
                            value={Number((value * 10_000n) / total) / 100}
                            color={color}
                        />
                    </Tooltip>
                ))}
        </Progress.Root>
    );
};

/**
 * The bonds a tournament holds: what its joins deposited, the gas refunds paid
 * from them, and the balance left, with a bar splitting where the money went.
 */
export const BondPool: FC<BondPoolProps> = ({
    balance,
    bondValue,
    loading,
    pool,
}) => {
    const depositedReady = pool.exact || !loading;

    return (
        <Stack gap="xs">
            <DetailRow label={text.bondValueTxt} hint={text.bondValueHint}>
                <Value
                    loading={loading}
                    value={
                        bondValue !== undefined ? (
                            <Group gap={6}>
                                <Text>{formatBondValue(bondValue)}</Text>
                                <Text size="sm" c="dimmed">
                                    {text.perJoinTxt}
                                </Text>
                            </Group>
                        ) : undefined
                    }
                />
            </DetailRow>
            <DetailRow label={text.depositedTxt}>
                <Value
                    loading={loading}
                    value={
                        depositedReady ? (
                            <Group gap={6}>
                                <Text>
                                    {pool.exact
                                        ? formatBondValue(pool.deposited)
                                        : `${text.atLeastTxt} ${formatBondValue(pool.deposited)}`}
                                </Text>
                                <Text size="sm" c="dimmed">
                                    {count(
                                        pool.joins,
                                        text.joinTxt,
                                        text.joinsTxt,
                                    )}
                                </Text>
                            </Group>
                        ) : undefined
                    }
                />
            </DetailRow>
            <DetailRow label={text.gasRefundedTxt}>
                <Group gap={6}>
                    <Text>{`− ${formatBondValue(pool.refunded)}`}</Text>
                    <Text size="sm" c="dimmed">
                        {count(pool.refunds, text.refundTxt, text.refundsTxt)}
                    </Text>
                </Group>
            </DetailRow>
            <DetailRow label={text.balanceTxt} hint={text.balanceHint}>
                <Value
                    loading={loading}
                    value={
                        balance !== undefined ? (
                            <Text fw={500}>{formatBondValue(balance)}</Text>
                        ) : undefined
                    }
                />
            </DetailRow>
            {balance !== undefined &&
                balance + pool.refunded + pool.paid + pool.burned > 0n && (
                    <DetailRow label="">
                        <BondSplitBar balance={balance} pool={pool} />
                    </DetailRow>
                )}
        </Stack>
    );
};
