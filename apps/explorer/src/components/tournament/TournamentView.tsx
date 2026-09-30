import type { BondEvent, Commitment, Match, Tournament } from "@cartesi/client";
import { Card, Center, Stack, Switch, Text, Title } from "@mantine/core";
import { isEmpty } from "ramda";
import { useState, type FC } from "react";
import type { Hash } from "viem";
import { content } from "../../content";
import {
    getBondPool,
    isBondRecovery,
    type JoinBond,
} from "../../lib/bondUtils";
import { formatMetaSpan } from "../../lib/metaCycleFormat";
import { getInnerTournamentAction } from "../../lib/disputeActions";
import { getTournamentCycleRange } from "../../lib/prtUtils";
import { BondLedger } from "../bond/BondLedger";
import { BondPool } from "../bond/BondPool";
import { BondRecoveryDetails } from "../bond/BondRecoveryDetails";
import { CycleRangeFormatted } from "../CycleRangeFormatted";
import { DetailRow } from "../DetailRow";
import { TournamentBreadcrumbSegment } from "../navigation/TournamentBreadcrumbSegment";
import { InnerTournamentAction } from "./InnerTournamentAction";
import { TournamentOutcome } from "./TournamentOutcome";
import { TournamentTable } from "./TournamentTable";

export type TournamentBondPool = {
    /**
     * Current balance of the tournament contract.
     */
    balance?: bigint;

    /**
     * Minimum bond each join must post.
     */
    bondValue?: bigint;

    /**
     * Bonds the commitments posted on join, as they resolve.
     */
    bonds: JoinBond[];

    /**
     * Whether the bond value, join bonds or balance are still being fetched.
     */
    loading?: boolean;
};

export type TournamentParentMatch = {
    /**
     * The sealed parent match this inner tournament settles.
     */
    match?: Match | null;

    /**
     * Called once a call settling the parent match is confirmed.
     */
    onActionConfirmed?: () => void;

    /**
     * Root children of the inner winner's parent commitment.
     */
    winnerChildren?: readonly [Hash, Hash];

    /**
     * Whether the winner's root children are still being read.
     */
    winnerChildrenLoading?: boolean;
};

export interface TournamentViewProps {
    /**
     * Bond refund and recovery events of the tournament.
     */
    bondEvents?: BondEvent[];

    /**
     * Bonds deposited into the tournament and its balance.
     */
    bondPool?: TournamentBondPool;

    /**
     * The list of all commitments.
     */
    commitments: Commitment[];

    /**
     * Called once a bond recovery sent from the page is confirmed.
     */
    onBondRecovered?: () => void;

    /**
     * The matches to display.
     */
    matches: Match[];

    /**
     * Parent match of an inner tournament, to settle it once finished.
     */
    parent?: TournamentParentMatch;

    /**
     * The tournament to display.
     */
    tournament: Tournament;
}

export const TournamentView: FC<TournamentViewProps> = (props) => {
    const {
        bondEvents = [],
        bondPool,
        commitments,
        matches,
        onBondRecovered,
        parent,
        tournament,
    } = props;

    const [hideWinners, setHideWinners] = useState(false);
    const noCommitments = isEmpty(commitments);
    const text = content.tournament;
    const bondSettled =
        tournament.snapshot.bondRecovery.disposition !== "TOURNAMENT_RUNNING";

    return (
        <Stack gap="xl">
            <Stack gap="xs">
                <DetailRow label={text.levelTxt}>
                    <TournamentBreadcrumbSegment
                        level={tournament.level}
                        variant="filled"
                    />
                </DetailRow>
                <DetailRow
                    label={text.cycleRangeTxt}
                    hint={text.cycle.rangeHint}
                >
                    <CycleRangeFormatted
                        range={getTournamentCycleRange(tournament)}
                    />
                </DetailRow>
                <DetailRow label={text.leafSizeTxt}>
                    <Text>{formatMetaSpan(tournament.log2step)}</Text>
                </DetailRow>
                <DetailRow label={text.spanTxt}>
                    <Text>
                        {formatMetaSpan(
                            tournament.log2step + tournament.height,
                        )}
                    </Text>
                </DetailRow>
                <TournamentOutcome snapshot={tournament.snapshot} />
                {getInnerTournamentAction(tournament, parent?.match) && (
                    <DetailRow label={text.innerAction.labelTxt}>
                        <InnerTournamentAction
                            child={tournament}
                            parentMatch={parent?.match}
                            winnerChildren={parent?.winnerChildren}
                            winnerChildrenLoading={
                                parent?.winnerChildrenLoading
                            }
                            onConfirmed={parent?.onActionConfirmed}
                        />
                    </DetailRow>
                )}
            </Stack>

            {(bondSettled || bondPool) && (
                <Stack gap="sm">
                    <Title order={3} c="dimmed">
                        {content.bond.bondTxt}
                    </Title>
                    <BondRecoveryDetails
                        bondRecovery={tournament.snapshot.bondRecovery}
                        recovery={bondEvents.find(isBondRecovery)}
                        tournamentAddress={tournament.address}
                        onRecovered={onBondRecovered}
                    />
                    {bondPool && (
                        <BondPool
                            balance={bondPool.balance}
                            bondValue={bondPool.bondValue}
                            loading={bondPool.loading}
                            pool={getBondPool(
                                bondPool.bonds,
                                commitments.length,
                                bondEvents,
                            )}
                        />
                    )}
                </Stack>
            )}

            <Stack gap="sm">
                <Title order={3} c="dimmed">
                    {text.matchesTxt}
                </Title>
                <Switch
                    label={text.showPendingMatchesTxt}
                    labelPosition="left"
                    size="md"
                    checked={hideWinners}
                    onChange={(event) =>
                        setHideWinners(event.currentTarget.checked)
                    }
                />
                <TournamentTable
                    candidate={tournament.snapshot.candidate}
                    matches={matches}
                    hideWinners={hideWinners}
                />
                {noCommitments && (
                    <Card>
                        <Center>
                            <Title order={3}>{text.noClaimsTxt}</Title>
                        </Center>
                    </Card>
                )}
            </Stack>

            <Stack gap="sm">
                <Title order={3} c="dimmed">
                    {text.bondEventsTxt}
                </Title>
                <BondLedger events={bondEvents} />
            </Stack>
        </Stack>
    );
};
