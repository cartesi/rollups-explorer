import type { BondEvent, Tournament } from "@cartesi/client";
import {
    Collapse,
    Group,
    Stack,
    Text,
    Title,
    UnstyledButton,
    useMantineTheme,
} from "@mantine/core";
import { useState, type FC } from "react";
import { TbChevronDown, TbChevronUp } from "react-icons/tb";
import { content } from "../../content";
import {
    formatBondValue,
    getBondPool,
    isBondRecovery,
} from "../../lib/bondUtils";
import { BondPool, BondSplitBar } from "../bond/BondPool";
import { BondRecoveryAction } from "../bond/BondRecoveryAction";
import {
    BondDispositionBadge,
    BondRecoveryDetails,
} from "../bond/BondRecoveryDetails";
import type { TournamentBondPool } from "./TournamentView";

export interface TournamentBondSectionProps {
    /**
     * Bond refund and recovery events of the tournament.
     */
    bondEvents: BondEvent[];

    /**
     * Bonds deposited into the tournament and its balance.
     */
    bondPool?: TournamentBondPool;

    /**
     * Number of commitments that joined the tournament.
     */
    joins: number;

    /**
     * Called once a bond recovery sent from the section is confirmed.
     */
    onBondRecovered?: () => void;

    /**
     * Whether the section starts expanded. Defaults to collapsed.
     */
    defaultOpen?: boolean;

    tournament: Tournament;
}

/**
 * The tournament bond, collapsed to a one-line summary: the status, the split
 * bar, the balance left and, when recoverable, the recovery action. Expanding
 * it shows every bond row instead.
 */
export const TournamentBondSection: FC<TournamentBondSectionProps> = ({
    bondEvents,
    bondPool,
    defaultOpen = false,
    joins,
    onBondRecovered,
    tournament,
}) => {
    const theme = useMantineTheme();
    const [open, setOpen] = useState(defaultOpen);
    const { bondRecovery } = tournament.snapshot;
    const { disposition } = bondRecovery;
    const running = disposition === "TOURNAMENT_RUNNING";
    const recoverable = disposition === "RECOVERABLE";
    const pool = bondPool && getBondPool(bondPool.bonds, joins, bondEvents);
    const balance = bondPool?.balance;

    return (
        <Stack gap="sm">
            <Group gap="md" wrap="nowrap">
                <UnstyledButton
                    onClick={() => setOpen((value) => !value)}
                    aria-expanded={open}
                >
                    <Group gap="md" wrap="nowrap">
                        <Group
                            gap={6}
                            wrap="nowrap"
                            w={{ sm: 160 }}
                            style={{ flexShrink: 0 }}
                        >
                            <Title order={3} c="dimmed">
                                {content.bond.bondTxt}
                            </Title>
                            {open ? (
                                <TbChevronUp
                                    size={theme.other.smIconSize}
                                    color="var(--mantine-color-dimmed)"
                                />
                            ) : (
                                <TbChevronDown
                                    size={theme.other.smIconSize}
                                    color="var(--mantine-color-dimmed)"
                                />
                            )}
                        </Group>
                        {!open && (
                            <Group gap="md" wrap="nowrap">
                                {!running && (
                                    <BondDispositionBadge
                                        disposition={disposition}
                                    />
                                )}
                                {pool && (
                                    <BondSplitBar
                                        balance={balance}
                                        pool={pool}
                                        w={200}
                                        visibleFrom={running ? undefined : "sm"}
                                    />
                                )}
                                {!recoverable &&
                                    balance !== undefined &&
                                    balance > 0n && (
                                        <Text
                                            size="sm"
                                            c="dimmed"
                                            visibleFrom="sm"
                                        >
                                            {formatBondValue(balance)}
                                        </Text>
                                    )}
                            </Group>
                        )}
                    </Group>
                </UnstyledButton>
                {!open && recoverable && (
                    <Group visibleFrom="sm">
                        <BondRecoveryAction
                            tournamentAddress={tournament.address}
                            onRecovered={onBondRecovered}
                        />
                    </Group>
                )}
            </Group>
            <Collapse in={open}>
                <Stack gap="sm">
                    <BondRecoveryDetails
                        bondRecovery={bondRecovery}
                        recovery={bondEvents.find(isBondRecovery)}
                        tournamentAddress={tournament.address}
                        onRecovered={onBondRecovered}
                        withAction={open}
                    />
                    {bondPool && pool && (
                        <BondPool
                            balance={balance}
                            bondValue={bondPool.bondValue}
                            loading={bondPool.loading}
                            pool={pool}
                        />
                    )}
                </Stack>
            </Collapse>
        </Stack>
    );
};
