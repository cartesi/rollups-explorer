import type { BondEvent, Commitment, Match, Tournament } from "@cartesi/client";
import { Card, Center, Stack, Switch, Text, Title } from "@mantine/core";
import { isEmpty } from "ramda";
import { useState, type FC } from "react";
import { content } from "../../content";
import { isBondRecovery } from "../../lib/bondUtils";
import { formatMetaSpan } from "../../lib/metaCycleFormat";
import { getTournamentCycleRange } from "../../lib/prtUtils";
import { BondLedger } from "../bond/BondLedger";
import { BondRecoveryDetails } from "../bond/BondRecoveryDetails";
import { CycleRangeFormatted } from "../CycleRangeFormatted";
import { DetailRow } from "../DetailRow";
import { TournamentBreadcrumbSegment } from "../navigation/TournamentBreadcrumbSegment";
import { TournamentOutcome } from "./TournamentOutcome";
import { TournamentTable } from "./TournamentTable";

export interface TournamentViewProps {
    /**
     * Bond refund and recovery events of the tournament.
     */
    bondEvents?: BondEvent[];

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
     * The tournament to display.
     */
    tournament: Tournament;
}

export const TournamentView: FC<TournamentViewProps> = (props) => {
    const {
        bondEvents = [],
        commitments,
        matches,
        onBondRecovered,
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
            </Stack>

            {bondSettled && (
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
