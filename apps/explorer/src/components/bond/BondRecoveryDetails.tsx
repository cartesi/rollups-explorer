import type { BondDisposition, TournamentBondRecovery } from "@cartesi/client";
import { Badge, Stack, Text, type MantineColor } from "@mantine/core";
import type { FC } from "react";
import type { Address as EthAddress } from "viem";
import { formatBondValue, type BondRecoveredEvent } from "../../lib/bondUtils";
import { content } from "../../content";
import Address from "../Address";
import { DetailRow } from "../DetailRow";
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
}

export const BondRecoveryDetails: FC<BondRecoveryDetailsProps> = ({
    bondRecovery,
    onRecovered,
    recovery,
    tournamentAddress,
}) => {
    const { disposition } = bondRecovery;
    if (disposition === "TOURNAMENT_RUNNING") return null;

    const hint = dispositionHints[disposition];

    return (
        <Stack gap="xs">
            <DetailRow label={text.statusTxt} hint={hint}>
                <Badge color={dispositionColors[disposition]}>
                    {text.disposition[disposition]}
                </Badge>
            </DetailRow>
            {bondRecovery.disposition === "RECOVERABLE" && (
                <>
                    {bondRecovery.claimer && (
                        <DetailRow label={text.claimerTxt}>
                            <Address value={bondRecovery.claimer} />
                        </DetailRow>
                    )}
                    {bondRecovery.payment !== null && (
                        <DetailRow label={text.unclaimedPaymentTxt}>
                            <Text>{formatBondValue(bondRecovery.payment)}</Text>
                        </DetailRow>
                    )}
                    {tournamentAddress && (
                        <DetailRow label="">
                            <BondRecoveryAction
                                tournamentAddress={tournamentAddress}
                                onRecovered={onRecovered}
                            />
                        </DetailRow>
                    )}
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
