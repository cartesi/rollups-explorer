import type { BondDisposition, TournamentBondRecovery } from "@cartesi/client";
import {
    Badge,
    Card,
    Group,
    Stack,
    Text,
    type MantineColor,
} from "@mantine/core";
import type { FC } from "react";
import type { Address as EthAddress } from "viem";
import { formatBondValue, type BondRecoveredEvent } from "../../lib/bondUtils";
import { content } from "../../content";
import Address from "../Address";
import { InfoHint } from "../InfoHint";
import { BondRecoveryAction } from "./BondRecoveryAction";
import TransactionHash from "../TransactionHash";

const text = content.bond;

type SettledDisposition = Exclude<BondDisposition, "TOURNAMENT_RUNNING">;

const dispositionColors: Record<SettledDisposition, MantineColor> = {
    NO_WINNER: "gray",
    RECOVERABLE: "yellow",
    RECOVERED: "green",
};

const dispositionHints: Partial<Record<SettledDisposition, string>> =
    text.dispositionHint;

export interface BondRecoveryCardProps {
    /**
     * Bond recovery state from the tournament snapshot.
     */
    bondRecovery: TournamentBondRecovery;

    /**
     * Called once a recovery sent from the card is confirmed.
     */
    onRecovered?: () => void;

    /**
     * The event that recovered the bond, once recovered.
     */
    recovery?: BondRecoveredEvent;

    /**
     * The tournament holding the bond. Without it the card cannot send a
     * recovery.
     */
    tournamentAddress?: EthAddress;
}

export const BondRecoveryCard: FC<BondRecoveryCardProps> = ({
    bondRecovery,
    onRecovered,
    recovery,
    tournamentAddress,
}) => {
    const { disposition } = bondRecovery;
    if (disposition === "TOURNAMENT_RUNNING") return null;

    const hint = dispositionHints[disposition];

    return (
        <Card withBorder radius="md">
            <Stack gap="xs">
                <Group>
                    <Text fw="bold">{text.bondTxt}</Text>
                    <Badge color={dispositionColors[disposition]}>
                        {text.disposition[disposition]}
                    </Badge>
                    {hint && <InfoHint label={hint} />}
                </Group>
                {bondRecovery.disposition === "RECOVERABLE" && (
                    <>
                        {bondRecovery.claimer && (
                            <Group>
                                <Text>{text.claimerTxt}</Text>
                                <Address value={bondRecovery.claimer} />
                            </Group>
                        )}
                        {bondRecovery.payment !== null && (
                            <Group>
                                <Text>{text.unclaimedPaymentTxt}</Text>
                                <Text>
                                    {formatBondValue(bondRecovery.payment)}
                                </Text>
                            </Group>
                        )}
                        {tournamentAddress && (
                            <BondRecoveryAction
                                tournamentAddress={tournamentAddress}
                                onRecovered={onRecovered}
                            />
                        )}
                    </>
                )}
                {recovery && (
                    <>
                        <Group>
                            <Text>{text.claimerTxt}</Text>
                            <Address value={recovery.recovery.claimer} />
                        </Group>
                        <Group>
                            <Text>{text.paidTxt}</Text>
                            <Text>
                                {formatBondValue(recovery.recovery.payment)}
                            </Text>
                        </Group>
                        <Group>
                            <Text>{text.burnedTxt}</Text>
                            <Text>
                                {formatBondValue(recovery.recovery.burned)}
                            </Text>
                        </Group>
                        <Group>
                            <Text>{text.transactionTxt}</Text>
                            <TransactionHash
                                transactionHash={recovery.txHash}
                            />
                        </Group>
                    </>
                )}
            </Stack>
        </Card>
    );
};
