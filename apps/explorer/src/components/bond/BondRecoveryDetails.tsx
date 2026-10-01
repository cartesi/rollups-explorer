import type { BondDisposition, TournamentBondRecovery } from "@cartesi/client";
import {
    Badge,
    Group,
    Stack,
    Text,
    type BadgeProps,
    type MantineColor,
} from "@mantine/core";
import type { FC } from "react";
import type { Address as EthAddress } from "viem";
import { formatBondValue, type BondRecoveredEvent } from "../../lib/bondUtils";
import { content } from "../../content";
import Address from "../Address";
import { DetailRow } from "../DetailRow";
import { BondRecoveryAction } from "./BondRecoveryAction";
import TransactionHash from "../TransactionHash";

const text = content.bond;

export type SettledDisposition = Exclude<BondDisposition, "TOURNAMENT_RUNNING">;

const dispositionColors: Record<SettledDisposition, MantineColor> = {
    NO_WINNER: "gray",
    RECOVERABLE: "yellow",
    RECOVERED: "green",
};

const dispositionHints: Partial<Record<SettledDisposition, string>> =
    text.dispositionHint;

export const BondDispositionBadge: FC<
    { disposition: SettledDisposition } & Omit<BadgeProps, "color" | "children">
> = ({ disposition, ...props }) => (
    <Badge color={dispositionColors[disposition]} {...props}>
        {text.disposition[disposition]}
    </Badge>
);

export interface BondRecoveryDetailsProps {
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

    /**
     * Whether to offer the recovery next to the unclaimed payment. Defaults to
     * true.
     */
    withAction?: boolean;
}

export const BondRecoveryDetails: FC<BondRecoveryDetailsProps> = ({
    bondRecovery,
    onRecovered,
    recovery,
    tournamentAddress,
    withAction = true,
}) => {
    const { disposition } = bondRecovery;
    if (disposition === "TOURNAMENT_RUNNING") return null;

    const hint = dispositionHints[disposition];

    return (
        <Stack gap="xs">
            <DetailRow label={text.statusTxt} hint={hint}>
                <BondDispositionBadge disposition={disposition} />
            </DetailRow>
            {bondRecovery.disposition === "RECOVERABLE" && (
                <>
                    {bondRecovery.claimer && (
                        <DetailRow label={text.claimerTxt}>
                            <Address value={bondRecovery.claimer} />
                        </DetailRow>
                    )}
                    <DetailRow label={text.unclaimedPaymentTxt}>
                        <Group gap="sm" wrap="nowrap" align="flex-start">
                            {bondRecovery.payment !== null && (
                                <Text mt={6}>
                                    {formatBondValue(bondRecovery.payment)}
                                </Text>
                            )}
                            {withAction && tournamentAddress && (
                                <BondRecoveryAction
                                    tournamentAddress={tournamentAddress}
                                    onRecovered={onRecovered}
                                />
                            )}
                        </Group>
                    </DetailRow>
                </>
            )}
            {recovery && (
                <>
                    <DetailRow label={text.claimerTxt}>
                        <Address value={recovery.recovery.claimer} />
                    </DetailRow>
                    <DetailRow label={text.paidTxt}>
                        <Text>
                            {formatBondValue(recovery.recovery.payment)}
                        </Text>
                    </DetailRow>
                    <DetailRow label={text.burnedTxt}>
                        <Text>{formatBondValue(recovery.recovery.burned)}</Text>
                    </DetailRow>
                    <DetailRow label={text.transactionTxt}>
                        <TransactionHash transactionHash={recovery.txHash} />
                    </DetailRow>
                </>
            )}
        </Stack>
    );
};
